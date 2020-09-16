import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  incomeValue: number;
  outcomeValue: number;
  total: number;
}
interface BalanceDTO {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<BalanceDTO> {
    const transactions = await this.find();
    const { incomeValue, outcomeValue } = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.incomeValue += Number(transaction.value);
            break;
          case 'outcome':
            accumulator.outcomeValue += Number(transaction.value);
            break;
          default:
            break;
        }
        return accumulator;
      },
      {
        incomeValue: 0,
        outcomeValue: 0,
        total: 0,
      },
    );
    const income = incomeValue - 0;
    const outcome = outcomeValue - 0;
    const total = incomeValue - outcomeValue;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
