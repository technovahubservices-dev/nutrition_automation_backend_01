function normalizeMobileNo(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function isDebugEnabled() {
  return String(process.env.WHATSAPP_DEBUG || '').toLowerCase() === 'true';
}

function buildTemplateParameters(templateVariables) {
  if (!templateVariables) return [];

  const values = Array.isArray(templateVariables)
    ? templateVariables
    : String(templateVariables)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

  return values.map((value) => ({
    type: 'text',
    text: String(value),
  }));
}

async function sendWhatsAppMessage({
  sendNumber,
  message,
  templateName,
  templateLanguage = 'en_US',
  templateVariables = [],
}) {
  const GRAPH_API_VERSION =
    process.env.GRAPH_API_VERSION || 'v23.0';

  const WHATSAPP_TOKEN =
    process.env.WHATSAPP_TOKEN || '';

  const WHATSAPP_PHONE_NUMBER_ID =
    process.env.WHATSAPP_PHONE_NUMBER_ID || '';

  const resolvedTemplateName = String(
    templateName ||
      process.env.WHATSAPP_TEMPLATE_NAME ||
      ''
  ).trim();

  const resolvedTemplateLanguage = String(
    templateLanguage ||
      process.env.WHATSAPP_TEMPLATE_LANGUAGE ||
      'en_US'
  ).trim() || 'en_US';

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error(
      'Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment variables.'
    );
  }

  const to = normalizeMobileNo(sendNumber);

  if (!to) {
    throw new Error('Valid WhatsApp phone number is required.');
  }

  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}` +
    `/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const templateParameters =
    buildTemplateParameters(templateVariables);

  const useTemplate = Boolean(resolvedTemplateName);

  const payload = useTemplate
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: resolvedTemplateName,
          language: {
            code: resolvedTemplateLanguage,
          },
          ...(templateParameters.length
            ? {
                components: [
                  {
                    type: 'body',
                    parameters: templateParameters,
                  },
                ],
              }
            : {}),
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: String(message || '').trim(),
        },
      };

  if (!useTemplate && !payload.text.body) {
    throw new Error(
      'Message is required when template is not used.'
    );
  }

  if (isDebugEnabled()) {
    console.log('[WhatsApp] Sending message', {
      to,
      type: payload.type,
      templateName: resolvedTemplateName || null,
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (isDebugEnabled()) {
    console.log('[WhatsApp] Meta response', {
      ok: response.ok,
      status: response.status,
      data,
    });
  }

  if (!response.ok) {
    const details =
      data?.error?.message ||
      JSON.stringify(data);

    throw new Error(
      `Meta API request failed: ${details}`
    );
  }

  return data;
}

module.exports = {
  sendWhatsAppMessage,
};