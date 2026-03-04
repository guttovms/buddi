import { createClient } from '@/lib/supabase/server'
import { getPublicBudget } from '@/lib/services/budgets'
import { formatCurrency, formatDate } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: budget } = await getPublicBudget(supabase, id)

  if (!budget) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  // Generate simple HTML for PDF (can be replaced with @react-pdf/renderer)
  const profile = budget.profile
  const brandColor = profile?.brand_color || '#2563eb'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { color: ${brandColor}; margin-bottom: 4px; }
        .header { border-bottom: 2px solid ${brandColor}; padding-bottom: 20px; margin-bottom: 20px; }
        .info { color: #666; font-size: 14px; }
        .client-box { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; color: #666; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .total { text-align: right; font-size: 20px; font-weight: bold; color: ${brandColor}; }
        .conditions { background: #fefce8; padding: 16px; border-radius: 8px; font-size: 14px; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        ${profile?.logo_url ? `<img src="${profile.logo_url}" alt="Logo" style="max-height: 50px; max-width: 160px; object-fit: contain; margin-bottom: 8px;">` : ''}
        <h1>${profile?.business_name || 'Orçamento'}</h1>
        <p class="info">${profile?.owner_name || ''} ${profile?.phone ? '· ' + profile.phone : ''} ${profile?.email ? '· ' + profile.email : ''}</p>
        <p class="info">${profile?.address || ''} ${profile?.city ? '· ' + profile.city : ''} ${profile?.state ? '- ' + profile.state : ''}</p>
      </div>

      <div class="client-box">
        <strong>Cliente:</strong> ${budget.client?.name || 'N/A'}<br>
        <span class="info">Orçamento #${budget.number} · ${formatDate(budget.created_at)} · Válido por ${budget.validity_days} dias</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Preço Unit.</th>
            <th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${budget.items
            .map(
              (item) => `
            <tr>
              <td><strong>${item.service_name}</strong>${item.description ? '<br><small style="color:#999">' + item.description + '</small>' : ''}</td>
              <td>${item.quantity} ${item.unit}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td style="text-align:right">${formatCurrency(item.total)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <p class="total">Total: ${formatCurrency(budget.total)}</p>

      ${
        budget.payment_conditions || budget.notes
          ? `
        <div class="conditions">
          ${budget.payment_conditions ? `<p><strong>Condições de Pagamento:</strong> ${budget.payment_conditions}</p>` : ''}
          ${budget.notes ? `<p><strong>Observações:</strong> ${budget.notes}</p>` : ''}
        </div>
      `
          : ''
      }

      <div class="footer">
        Gerado por Buddi
      </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
