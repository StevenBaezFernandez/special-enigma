<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:fn="http://www.w3.org/2005/xpath-functions">
  <xsl:template name="Requerido">
    <xsl:param name="valor"/>
    <xsl:text>|</xsl:text>
    <xsl:call-template name="ManejoDeCaracteres">
      <xsl:with-param name="valor" select="$valor"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template name="Opcional">
    <xsl:param name="valor"/>
    <xsl:if test="$valor">
      <xsl:text>|</xsl:text>
      <xsl:call-template name="ManejoDeCaracteres">
        <xsl:with-param name="valor" select="$valor"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  <xsl:template name="ManejoDeCaracteres">
    <xsl:param name="valor"/>
    <xsl:value-of select="translate(normalize-space($valor), '|', '')"/>
  </xsl:template>
</xsl:stylesheet>
