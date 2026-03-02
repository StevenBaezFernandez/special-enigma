import { Injectable, Logger, Inject } from '@nestjs/common';
import { BankStatementParser, BANK_STATEMENT_PARSER } from '../ports/bank-statement-parser.port';
import { StatementLine } from '@virteex/domain-treasury-contracts';

@Injectable()
export class BankStatementParserService {
  private readonly logger = new Logger(BankStatementParserService.name);

  constructor(
    @Inject(BANK_STATEMENT_PARSER) private readonly parsers: BankStatementParser[]
  ) {}

  async parseFile(filename: string, content: Buffer | string): Promise<StatementLine[]> {
    const parser = this.parsers.find(p => p.supports(filename));

    if (!parser) {
      this.logger.error(`No suitable parser found for file: ${filename}`);
      throw new Error(`Unsupported bank statement format: ${filename}`);
    }

    const result = await parser.parse(content);
    this.logger.log(`Parsed ${result.lines.length} entries from ${filename} (${result.metadata['format']})`);
    return result.lines;
  }

  parseCsv(content: string): StatementLine[] {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    return lines.map(line => {
      const parts = line.split(',');
      return {
        date: new Date(parts[0]),
        amount: parseFloat(parts[1]),
        description: parts[2],
        reference: parts[3]
      };
    });
  }
}
