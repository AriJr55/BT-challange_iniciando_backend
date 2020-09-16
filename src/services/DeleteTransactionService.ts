// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    try {
      const transaction = await transactionRepository.findOne({ id });
      if (!transaction) {
        throw new Error('Transaction not found.');
      }
      await transactionRepository.delete({ id });
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default DeleteTransactionService;
