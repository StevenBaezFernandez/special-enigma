import { BankStatementParser, ParserResult, StatementLine } from '../../../../contracts/src/lib/ports/bank-statement-parser.port';

export class OfxBankStatementParser implements BankStatementParser {
    supports(filename: string): boolean {
        return filename.toLowerCase().endsWith('.ofx');
    }

    async parse(content: Buffer | string): Promise<ParserResult> {
        const text = content.toString();
        const lines: StatementLine[] = [];

        // Basic OFX parsing using regex for STMTTRN blocks
        const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
        let match;

        while ((match = transactionRegex.exec(text)) !== null) {
            const block = match[1];

            const trnamt = /<TRNAMT>([\d.-]+)/.exec(block)?.[1];
            const dtposted = /<DTPOSTED>(\d{8})/.exec(block)?.[1];
            const name = /<NAME>(.*)/.exec(block)?.[1];
            const fitid = /<FITID>(.*)/.exec(block)?.[1];

            if (trnamt && dtposted) {
                const year = parseInt(dtposted.substring(0, 4));
                const month = parseInt(dtposted.substring(4, 6)) - 1;
                const day = parseInt(dtposted.substring(6, 8));

                lines.push({
                    amount: parseFloat(trnamt),
                    date: new Date(year, month, day),
                    description: name?.trim() || 'Unknown',
                    reference: fitid?.trim()
                });
            }
        }

        return {
            lines,
            metadata: { format: 'OFX', count: lines.length }
        };
    }
}
