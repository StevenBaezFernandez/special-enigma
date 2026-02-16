const { xsltProcess, xmlParse } = require('xslt-processor');
console.log('xmlParse:', xmlParse);
console.log('xsltProcess:', xsltProcess);
const xml = '<root><a>test</a></root>';
const xslt = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"><b><xsl:value-of select="root/a"/></b></xsl:template></xsl:stylesheet>';
try {
  const parsedXml = xmlParse(xml);
  const parsedXslt = xmlParse(xslt);
  const result = xsltProcess(parsedXml, parsedXslt);
  console.log('Result:', result);
} catch (e) {
  console.error(e);
}
