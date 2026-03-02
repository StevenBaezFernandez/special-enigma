import { BankStatementParserInterface, ParserResult } from './parser.interface';
import { StatementLine } from '@virteex/domain-treasury-contracts';

export class OfxBankStatementParser implements BankStatementParserInterface {
    supports(filename: string): boolean {
        return filename.toLowerCase().endsWith('.ofx');
    }

    async parse(content: Buffer | string): Promise<ParserResult> {
        const text = content.toString();
        const regex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
        const lines: StatementLine[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
           const trn = match[1];
           const dateMatch = trn.match(/<DTPOSTED>(\d{8})/);
           const amountMatch = trn.match(/<TRNAMT>([-.\d]+)/);
           const nameMatch = trn.match(/<NAME>([^<]+)/);
           const refMatch = trn.match(/<FITID>([^<]+)/);

           if (dateMatch && amountMatch) {
               const dateStr = dateMatch[1];
               const date = new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`);
               lines.push({
                   date,
                   amount: parseFloat(amountMatch[1]),
                   description: nameMatch ? nameMatch[1].trim() : '',
                   reference: refMatch ? refMatch[1].trim() : undefined,
                   matched: false
               });
           }
        }

        return {
            lines,
            metadata: {
                format: 'OFX',
                rowCount: lines.length
            }
        };
    }
}
