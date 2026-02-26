import { Injectable, Logger } from '@nestjs/common';
import { XMLBuilder } from 'fast-xml-parser';
import { FiscalDocumentBuilder } from '@virteex/domain-fiscal-domain';
import { Invoice, CustomerBillingInfo } from '@virteex/domain-billing-domain';
import { TenantFiscalConfig } from '@virteex/domain-fiscal-domain';


@Injectable()
export class BrFiscalDocumentBuilder implements FiscalDocumentBuilder {
  private readonly logger = new Logger(BrFiscalDocumentBuilder.name);

  async build(invoice: Invoice, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfo): Promise<string> {
    this.logger.log(`Building SEFAZ NFe for ${invoice.id}`);

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true
    });

    const items = invoice.items.getItems();
    const totalAmount = invoice.totalAmount;

    // NFe Structure (Simplified for robustness in demo)
    const nfeObj = {
        'NFe': {
            '@_xmlns': 'http://www.portalfiscal.inf.br/nfe',
            'infNFe': {
                '@_Id': `NFe${tenantConfig.taxId}${invoice.id}`, // Chave de Acesso simulated
                '@_versao': '4.00',
                'ide': {
                    'cUF': '35', // SP
                    'cNF': invoice.id.substring(0, 8),
                    'natOp': 'VENDA DE MERCADORIA',
                    'mod': '55', // NFe Model
                    'serie': '1',
                    'nNF': invoice.id.replace(/\D/g, '').substring(0, 9),
                    'dhEmi': new Date().toISOString(),
                    'tpNF': '1', // Saída
                    'idDest': '1', // Internal
                    'cMunFG': '3550308', // Sao Paulo
                    'tpImp': '1',
                    'tpEmis': '1',
                    'cDV': '0',
                    'tpAmb': '2', // Homologacao
                    'finNFe': '1', // Normal
                    'indFinal': '1',
                    'indPres': '1',
                    'procEmi': '0',
                    'verProc': 'Virteex 13.0'
                },
                'emit': {
                    'CNPJ': tenantConfig.taxId,
                    'xNome': tenantConfig.legalName,
                    'enderEmit': {
                        'xLgr': 'Rua Teste',
                        'nro': '123',
                        'xBairro': 'Centro',
                        'cMun': '3550308',
                        'xMun': 'Sao Paulo',
                        'UF': 'SP',
                        'CEP': tenantConfig.postalCode,
                        'cPais': '1058',
                        'xPais': 'BRASIL'
                    },
                    'IE': tenantConfig.regime, // Inscricao Estadual
                    'CRT': '3'
                },
                'dest': {
                    'CNPJ': customer.taxId,
                    'xNome': customer.legalName,
                    'enderDest': {
                        'xLgr': 'Rua Cliente',
                        'nro': '456',
                        'xBairro': 'Bairro',
                        'cMun': '3550308',
                        'xMun': 'Sao Paulo',
                        'UF': 'SP',
                        'CEP': customer.postalCode,
                        'cPais': '1058',
                        'xPais': 'BRASIL'
                    },
                    'indIEDest': '9'
                },
                'det': items.map((item, index) => ({
                    '@_nItem': (index + 1).toString(),
                    'prod': {
                        'cProd': item.productId,
                        'cEAN': 'SEM GTIN',
                        'xProd': item.description,
                        'NCM': '84713012', // Example NCM
                        'CFOP': '5102',
                        'uCom': 'UN',
                        'qCom': item.quantity,
                        'vUnCom': Number(item.unitPrice).toFixed(2),
                        'vProd': Number(item.amount).toFixed(2),
                        'cEANTrib': 'SEM GTIN',
                        'uTrib': 'UN',
                        'qTrib': item.quantity,
                        'vUnTrib': Number(item.unitPrice).toFixed(2),
                        'indTot': '1'
                    },
                    'imposto': {
                        'ICMS': {
                            'ICMS00': {
                                'orig': '0',
                                'CST': '00',
                                'modBC': '3',
                                'vBC': Number(item.amount).toFixed(2),
                                'pICMS': '18.00',
                                'vICMS': (Number(item.amount) * 0.18).toFixed(2)
                            }
                        },
                        'PIS': {
                            'PISAliq': {
                                'CST': '01',
                                'vBC': Number(item.amount).toFixed(2),
                                'pPIS': '1.65',
                                'vPIS': (Number(item.amount) * 0.0165).toFixed(2)
                            }
                        },
                        'COFINS': {
                            'COFINSAliq': {
                                'CST': '01',
                                'vBC': Number(item.amount).toFixed(2),
                                'pCOFINS': '7.60',
                                'vCOFINS': (Number(item.amount) * 0.076).toFixed(2)
                            }
                        }
                    }
                })),
                'total': {
                    'ICMSTot': {
                        'vBC': totalAmount,
                        'vICMS': (Number(totalAmount) * 0.18).toFixed(2), // Simplified
                        'vICMSDeson': '0.00',
                        'vFCP': '0.00',
                        'vBCST': '0.00',
                        'vST': '0.00',
                        'vFCPST': '0.00',
                        'vFCPSTRet': '0.00',
                        'vProd': totalAmount,
                        'vFrete': '0.00',
                        'vSeg': '0.00',
                        'vDesc': '0.00',
                        'vII': '0.00',
                        'vIPI': '0.00',
                        'vIPIDevol': '0.00',
                        'vPIS': (Number(totalAmount) * 0.0165).toFixed(2),
                        'vCOFINS': (Number(totalAmount) * 0.076).toFixed(2),
                        'vOutro': '0.00',
                        'vNF': (Number(totalAmount) * 1.2725).toFixed(2) // Approx with taxes
                    }
                },
                'transp': {
                    'modFrete': '9'
                },
                'pag': {
                    'detPag': {
                        'tPag': '01', // Dinheiro
                        'vPag': (Number(totalAmount) * 1.2725).toFixed(2)
                    }
                }
            }
        }
    };

    return builder.build(nfeObj);
  }
}
