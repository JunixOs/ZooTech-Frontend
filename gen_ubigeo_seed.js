const { getDepartments, getProvinces, getDistricts } = require('geo-peru');
const fs = require('fs');

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const deps = getDepartments();
let sql = 'SET NOCOUNT ON;\nBEGIN TRANSACTION;\n\n-- Departamentos\n';

deps.forEach(d => {
  const nombre = removeAccents(d.name).replace(/'/g, "''");
  sql += `IF NOT EXISTS (SELECT 1 FROM geo_departamento WHERE codigo = '${d.code}') INSERT INTO geo_departamento (codigo, nombre) VALUES ('${d.code}', '${nombre}');\n`;
});

sql += '\n-- Provincias\n';
deps.forEach(d => {
  getProvinces(d.code).forEach(p => {
    const nombre = removeAccents(p.name).replace(/'/g, "''");
    sql += `IF NOT EXISTS (SELECT 1 FROM geo_provincia WHERE codigo = '${p.code}') INSERT INTO geo_provincia (codigo, departamento_codigo, nombre) VALUES ('${p.code}', '${d.code}', '${nombre}');\n`;
  });
});

sql += '\n-- Distritos\n';
deps.forEach(d => {
  getProvinces(d.code).forEach(p => {
    getDistricts(p.code).forEach(dist => {
      const nombre = removeAccents(dist.name).replace(/'/g, "''");
      sql += `IF NOT EXISTS (SELECT 1 FROM geo_distrito WHERE codigo = '${dist.ubigeo}') INSERT INTO geo_distrito (codigo, provincia_codigo, nombre) VALUES ('${dist.ubigeo}', '${p.code}', '${nombre}');\n`;
    });
  });
});

sql += '\nCOMMIT;\n';
fs.writeFileSync('seed_ubigeo.sql', sql, { encoding: 'utf8' });
console.log('Done. Lines: ' + sql.split('\n').length);
