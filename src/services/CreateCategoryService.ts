import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const categoryExists = await categoryRepository.findOne({ title });

    if (categoryExists) {
      throw new Error('Category already created.');
    }

    const category = await this.createCategory(title);

    return category;
  }

  public async getCategoryId(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      where: {
        title,
      },
    });

    if (categoryExists) {
      return categoryExists;
    }
    const newCategory = await this.createCategory(title);
    return newCategory;
  }

  public async createCategory(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    console.log(title);
    const categoryExists = await categoryRepository.findOne({
      where: {
        title,
      },
    });

    console.log(categoryExists);
    if (categoryExists) {
      return categoryExists;
    }

    const category = categoryRepository.create({ title });
    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
