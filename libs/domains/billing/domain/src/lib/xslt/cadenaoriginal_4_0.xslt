<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11" xmlns:donat="http://www.sat.gob.mx/donat" xmlns:divisas="http://www.sat.gob.mx/divisas" xmlns:implocal="http://www.sat.gob.mx/implocal" xmlns:leyendasFisc="http://www.sat.gob.mx/leyendasFiscales" xmlns:pfic="http://www.sat.gob.mx/pfic" xmlns:tpe="http://www.sat.gob.mx/TuristaPasajeroExtranjero" xmlns:nomina12="http://www.sat.gob.mx/nomina12" xmlns:registrofiscal="http://www.sat.gob.mx/registrofiscal" xmlns:pago10="http://www.sat.gob.mx/Pagos" xmlns:pago20="http://www.sat.gob.mx/Pagos20" xmlns:cartaporte20="http://www.sat.gob.mx/CartaPorte20">
  <xsl:include href="utilerias.xslt"/>
  <xsl:include href="nomina12.xslt"/>

  <xsl:template match="/">|
    <xsl:apply-templates select="/cfdi:Comprobante"/>||</xsl:template>

  <xsl:template match="cfdi:Comprobante">
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Version"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Serie"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Folio"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Fecha"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@FormaPago"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@NoCertificado"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@CondicionesDePago"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@SubTotal"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Descuento"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Moneda"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@TipoCambio"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Total"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TipoDeComprobante"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Exportacion"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@MetodoPago"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@LugarExpedicion"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Confirmacion"/></xsl:call-template>

    <xsl:apply-templates select="./cfdi:InformacionGlobal"/>
    <xsl:apply-templates select="./cfdi:CfdiRelacionados"/>
    <xsl:apply-templates select="./cfdi:Emisor"/>
    <xsl:apply-templates select="./cfdi:Receptor"/>
    <xsl:apply-templates select="./cfdi:Conceptos/cfdi:Concepto"/>
    <xsl:apply-templates select="./cfdi:Impuestos"/>
    <xsl:apply-templates select="./cfdi:Complemento"/>
  </xsl:template>

  <xsl:template match="cfdi:InformacionGlobal">
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Periodicidad"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Meses"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Año"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="cfdi:CfdiRelacionados">
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TipoRelacion"/></xsl:call-template>
    <xsl:for-each select="./cfdi:CfdiRelacionado">
      <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@UUID"/></xsl:call-template>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="cfdi:Emisor">
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Rfc"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Nombre"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@RegimenFiscal"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@FacAtrAdquirente"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="cfdi:Receptor">
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Rfc"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Nombre"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@DomicilioFiscalReceptor"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@ResidenciaFiscal"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@NumRegIdTrib"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@RegimenFiscalReceptor"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@UsoCFDI"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="cfdi:Concepto">
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@ClaveProdServ"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@NoIdentificacion"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Cantidad"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@ClaveUnidad"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Unidad"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Descripcion"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@ValorUnitario"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Importe"/></xsl:call-template>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Descuento"/></xsl:call-template>
    <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@ObjetoImp"/></xsl:call-template>

    <xsl:for-each select="./cfdi:Impuestos/cfdi:Traslados/cfdi:Traslado">
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Base"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Impuesto"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TipoFactor"/></xsl:call-template>
       <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@TasaOCuota"/></xsl:call-template>
       <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@Importe"/></xsl:call-template>
    </xsl:for-each>
    <xsl:for-each select="./cfdi:Impuestos/cfdi:Retenciones/cfdi:Retencion">
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Base"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Impuesto"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TipoFactor"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TasaOCuota"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Importe"/></xsl:call-template>
    </xsl:for-each>
    <xsl:apply-templates select="./cfdi:ACuentaTerceros"/>
    <xsl:apply-templates select="./cfdi:InformacionAduanera"/>
    <xsl:apply-templates select="./cfdi:CuentaPredial"/>
    <xsl:apply-templates select="./cfdi:ComplementoConcepto"/>
    <xsl:apply-templates select="./cfdi:Parte"/>
  </xsl:template>

  <xsl:template match="cfdi:Impuestos">
    <xsl:for-each select="./cfdi:Retenciones/cfdi:Retencion">
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Impuesto"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Importe"/></xsl:call-template>
    </xsl:for-each>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@TotalImpuestosRetenidos"/></xsl:call-template>
    <xsl:for-each select="./cfdi:Traslados/cfdi:Traslado">
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Impuesto"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TipoFactor"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@TasaOCuota"/></xsl:call-template>
       <xsl:call-template name="Requerido"><xsl:with-param name="valor" select="./@Importe"/></xsl:call-template>
    </xsl:for-each>
    <xsl:call-template name="Opcional"><xsl:with-param name="valor" select="./@TotalImpuestosTrasladados"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="cfdi:Complemento">
    <xsl:apply-templates/>
  </xsl:template>

</xsl:stylesheet>
