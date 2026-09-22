import type { Centavos, DataCivil } from '../dominio/financeiro';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatarMoeda(valorCentavos: Centavos): string {
  if (!Number.isSafeInteger(valorCentavos)) {
    throw new RangeError('O valor deve ser um número inteiro seguro de centavos.');
  }

  return formatadorMoeda.format(valorCentavos / 100);
}

export function ehDataCivil(valor: string): valor is DataCivil {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

  const [ano, mes, dia] = valor.split('-').map(Number);
  if (ano < 1000 || mes < 1 || mes > 12 || dia < 1) return false;

  const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return dia <= diasNoMes;
}

/** Usa o dia local do aparelho, sem converter para UTC. */
export function paraDataCivil(data: Date): DataCivil {
  if (Number.isNaN(data.getTime())) throw new RangeError('Data inválida.');

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const valor = `${ano}-${mes}-${dia}`;

  if (!ehDataCivil(valor)) throw new RangeError('Data fora do intervalo suportado.');
  return valor;
}

export function formatarData(valor: DataCivil): string {
  if (!ehDataCivil(valor)) throw new RangeError('Data inválida.');

  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
}
