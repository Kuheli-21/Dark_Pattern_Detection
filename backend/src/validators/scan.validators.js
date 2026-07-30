const { z } = require('zod');

const scanSchema = z.object({
  url: z.string().trim().url('Invalid source URL format'),
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Domain is required')
    .transform((val) => val.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0]),
  textSnippets: z
    .array(z.string())
    .min(1, 'textSnippets must contain at least one text item')
    .max(100, 'Cannot process more than 100 text snippets per scan'),
});

module.exports = {
  scanSchema,
};
