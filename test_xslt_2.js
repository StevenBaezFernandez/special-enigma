const { XmlParser, Xslt } = require('xslt-processor');

async function main() {
    const parser = new XmlParser();
    const xmlString = '<root><a>test</a></root>';
    const xsltString = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"><b><xsl:value-of select="root/a"/></b></xsl:template></xsl:stylesheet>';

    try {
        const xml = parser.xmlParse(xmlString);
        const xslt = parser.xmlParse(xsltString);
        const processor = new Xslt();
        const result = await processor.xsltProcess(xml, xslt);
        console.log('Result:', result);
    } catch (e) {
        console.error(e);
    }
}
main();
