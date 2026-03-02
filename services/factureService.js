import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatDate, formatMontant } from '../utils/helpers';

const genererHTMLFacture = (vente, boutique) => {
  const articlesRows = vente.articles
    .map(
      (a) => `
      <tr>
        <td>${a.nom}</td>
        <td style="text-align:center">${a.quantite}</td>
        <td style="text-align:right">${a.prix.toLocaleString('fr-FR')}</td>
        <td style="text-align:right">${(a.prix * a.quantite).toLocaleString('fr-FR')}</td>
      </tr>
    `
    )
    .join('');

  const modePaiementLabel = {
    especes: 'Espèces',
    nita: 'NITA Mobile',
    amana: 'Amana Mobile',
  }[vente.modePaiement] || vente.modePaiement;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: bold; color: #E8720C; }
        .logo span { color: #2E8B57; }
        .boutique { text-align: right; color: #555; }
        .divider { height: 3px; background: linear-gradient(to right, #E8720C, #2E8B57); margin-bottom: 20px; border-radius: 2px; }
        .facture-info { display: flex; justify-content: space-between; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #E8720C; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #fafafa; }
        .total-box { background: #FFF8F0; border: 2px solid #E8720C; border-radius: 10px; padding: 16px 24px; min-width: 220px; float: right; }
        .total-box .amount { font-size: 24px; font-weight: bold; color: #E8720C; }
        .paiement-badge { display: inline-block; background: #2E8B57; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .footer { text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 16px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">NIGER<span>BIZ</span> 360</div>
          <div style="color:#888; font-size:11px; margin-top:4px;">Digitalisation des commerces</div>
        </div>
        <div class="boutique">
          <strong>${boutique || 'Ma Boutique'}</strong><br/>
          Niamey, Niger
        </div>
      </div>
      <div class="divider"></div>
      <div class="facture-info">
        <div>
          <div><strong>FACTURE N°</strong></div>
          <div style="font-size:15px; font-weight:bold; color:#E8720C;">${vente.numeroFacture}</div>
          ${vente.clientNom ? `<div style="margin-top:8px"><strong>Client :</strong> ${vente.clientNom}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div><strong>Date :</strong> ${formatDate(vente.createdAt, 'dd MMMM yyyy')}</div>
          <div><strong>Heure :</strong> ${formatDate(vente.createdAt, 'HH:mm')}</div>
          <div class="paiement-badge">${modePaiementLabel}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th style="text-align:center">Qté</th>
            <th style="text-align:right">Prix unit.</th>
            <th style="text-align:right">Sous-total</th>
          </tr>
        </thead>
        <tbody>${articlesRows}</tbody>
      </table>
      <div class="total-box">
        <div style="color:#666; font-size:12px; margin-bottom:6px;">TOTAL À PAYER</div>
        <div class="amount">${vente.totalAmount.toLocaleString('fr-FR')} FCFA</div>
      </div>
      <div class="footer">
        Merci pour votre achat ! 🙏<br/>
        <strong>NIGERBIZ 360</strong> — Votre partenaire commercial au Niger
      </div>
    </body>
    </html>
  `;
};

export const partagerFacture = async (vente, boutique) => {
  try {
    const html = genererHTMLFacture(vente, boutique);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Facture ${vente.numeroFacture}`,
      });
    }
    return { success: true, uri };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const imprimerFacture = async (vente, boutique) => {
  try {
    const html = genererHTMLFacture(vente, boutique);
    await Print.printAsync({ html });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};