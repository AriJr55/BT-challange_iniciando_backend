import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionService = new CreateTransactionService();
  try {
    const transaction = await transactionService.execute({
      title,
      value,
      type,
      category,
    });

    return response.json(transaction);
  } catch (err) {
    return response.status(400).json({ status: 'error', message: err.message });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();

  try {
    await deleteTransactionService.execute({ id });
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
  return response.status(204).json({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();

    const transactions = await importTransactionService.execute(
      request.file.path,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;
