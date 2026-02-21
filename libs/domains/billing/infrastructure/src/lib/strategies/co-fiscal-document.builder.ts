import { Injectable, Logger } from '@nestjs/common';
import { XMLBuilder } from 'fast-xml-parser';
import { FiscalDocumentBuilder } from '../../../../domain/src/lib/ports/fiscal-document-builder.port';
import { Invoice } from '../../../../domain/src/lib/entities/invoice.entity';
import { TenantFiscalConfig } from '../../../../domain/src/lib/ports/tenant-config.port';
import { CustomerBillingInfo } from '../../../../domain/src/lib/ports/customer.repository';

@Injectable()
export class CoFiscalDocumentBuilder implements FiscalDocumentBuilder {
  private readonly logger = new Logger(CoFiscalDocumentBuilder.name);

  async build(invoice: Invoice, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfo): Promise<string> {
    this.logger.log(`Building DIAN UBL 2.1 Invoice for ${invoice.id}`);

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true
    });

    const items = invoice.items.getItems();
    const taxTotalAmount = items.reduce((acc, item) => acc + Number(item.taxAmount), 0);
    const subTotalAmount = items.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalAmount = subTotalAmount + taxTotalAmount;

    // Simplified UBL 2.1 Structure for Colombia
    const invoiceObj = {
        'Invoice': {
            '@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
            '@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
            '@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
            '@_xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
            '@_xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
            '@_xmlns:sts': 'dian:gov:co:facturaelectronica:Structures-2-1',
            '@_xmlns:xades': 'http://uri.etsi.org/01903/v1.3.2#',
            '@_xmlns:xades141': 'http://uri.etsi.org/01903/v1.4.1#',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',

            'ext:UBLExtensions': {
                'ext:UBLExtension': {
                    'ext:ExtensionContent': {
                        'sts:DianExtensions': {
                            'sts:InvoiceControl': {
                                'sts:InvoiceAuthorization': tenantConfig.resolutionNumber || '18760000001',
                                'sts:AuthorizationPeriod': {
                                    'cbc:StartDate': '2023-01-01',
                                    'cbc:EndDate': '2024-01-01'
                                },
                                'sts:AuthorizedInvoices': {
                                    'sts:Prefix': 'SETT',
                                    'sts:From': '1',
                                    'sts:To': '5000000'
                                }
                            }
                        }
                    }
                }
            },
            'cbc:UBLVersionID': 'UBL 2.1',
            'cbc:CustomizationID': '10', // Standard Invoice
            'cbc:ProfileID': 'DIAN 2.1',
            'cbc:ID': invoice.id,
            'cbc:UUID': 'bd2f80164e837920302029302103', // Should be CUFE generated
            'cbc:IssueDate': new Date().toISOString().split('T')[0],
            'cbc:IssueTime': new Date().toISOString().split('T')[1].split('.')[0],
            'cbc:InvoiceTypeCode': '01',
            'cbc:Note': 'Factura de Venta',
            'cbc:DocumentCurrencyCode': 'COP',

            'cac:AccountingSupplierParty': {
                'cac:Party': {
                    'cac:PartyTaxScheme': {
                        'cbc:RegistrationName': tenantConfig.legalName,
                        'cbc:CompanyID': {
                            '@_schemeID': '31', // Nit
                            '@_schemeName': '31',
                            '#text': tenantConfig.taxId
                        },
                        'cac:TaxScheme': {
                            'cbc:ID': '01',
                            'cbc:Name': 'IVA'
                        }
                    }
                }
            },
            'cac:AccountingCustomerParty': {
                'cac:Party': {
                    'cac:PartyTaxScheme': {
                        'cbc:RegistrationName': customer.legalName,
                        'cbc:CompanyID': {
                            '@_schemeID': '13', // CC
                            '@_schemeName': '13',
                            '#text': customer.taxId
                        },
                        'cac:TaxScheme': {
                            'cbc:ID': '01',
                            'cbc:Name': 'IVA'
                        }
                    }
                }
            },
            'cac:PaymentMeans': {
                'cbc:ID': '1',
                'cbc:PaymentMeansCode': invoice.paymentMethod || '10', // Cash
                'cbc:PaymentDueDate': new Date().toISOString().split('T')[0]
            },
            'cac:TaxTotal': {
                'cbc:TaxAmount': {
                    '@_currencyID': 'COP',
                    '#text': taxTotalAmount.toFixed(2)
                },
                'cac:TaxSubtotal': {
                    'cbc:TaxableAmount': {
                        '@_currencyID': 'COP',
                        '#text': subTotalAmount.toFixed(2)
                    },
                    'cbc:TaxAmount': {
                        '@_currencyID': 'COP',
                        '#text': taxTotalAmount.toFixed(2)
                    },
                    'cac:TaxCategory': {
                        'cac:TaxScheme': {
                            'cbc:ID': '01',
                            'cbc:Name': 'IVA'
                        }
                    }
                }
            },
            'cac:LegalMonetaryTotal': {
                'cbc:LineExtensionAmount': {
                    '@_currencyID': 'COP',
                    '#text': subTotalAmount.toFixed(2)
                },
                'cbc:TaxExclusiveAmount': {
                     '@_currencyID': 'COP',
                    '#text': subTotalAmount.toFixed(2)
                },
                'cbc:TaxInclusiveAmount': {
                     '@_currencyID': 'COP',
                    '#text': totalAmount.toFixed(2)
                },
                'cbc:PayableAmount': {
                     '@_currencyID': 'COP',
                    '#text': totalAmount.toFixed(2)
                }
            },
            'cac:InvoiceLine': items.map((item, index) => ({
                'cbc:ID': (index + 1).toString(),
                'cbc:InvoicedQuantity': {
                    '@_unitCode': '94', // Unit
                    '#text': item.quantity
                },
                'cbc:LineExtensionAmount': {
                    '@_currencyID': 'COP',
                    '#text': Number(item.amount).toFixed(2)
                },
                'cac:Item': {
                    'cbc:Description': item.description,
                    'cac:StandardItemIdentification': {
                        'cbc:ID': item.productId
                    }
                },
                'cac:Price': {
                    'cbc:PriceAmount': {
                        '@_currencyID': 'COP',
                        '#text': Number(item.unitPrice).toFixed(2)
                    }
                }
            }))
        }
    };

    return builder.build(invoiceObj);
  }
}
