import { BankStatementParser, ParserResult } from '../../../application/src/lib/ports/bank-statement-parser.port';

// Re-export from port to maintain infra local availability if needed,
// though infra should implement the port.
export { BankStatementParser as BankStatementParserInterface, ParserResult };
