import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CsvLines {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: CsvLines[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      categories.push(category);
      lines.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const databaseCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const databaseCategoriesTitles = databaseCategories.map(
      (categoryEl: Category) => categoryEl.title,
    );
    const filterCategoriesTitle = categories
      .filter(category => !databaseCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      filterCategoriesTitle.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const totalCategories = [...newCategories, ...databaseCategories];

    const saveTransactions = transactionsRepository.create(
      lines.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: totalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(saveTransactions);

    await fs.promises.unlink(filePath);
    return saveTransactions;
  }
}
export default ImportTransactionsService;
