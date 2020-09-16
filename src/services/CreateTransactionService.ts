// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryService = new CreateCategoryService();

    console.log(category);
    const newCategory = await categoryService.createCategory(category);
    console.log(newCategory);

    const categoryCheck = await categoryService.getCategoryId(category);
    console.log(categoryCheck);
    const category_id = categoryCheck.id;

    const balance = await transactionRepository.getBalance();
    if (type !== 'income' && type !== 'outcome') {
      throw new Error('Operação inválida');
    }
    if (type === 'outcome' && balance.total < value) {
      throw new Error('Saldo infuciente');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
