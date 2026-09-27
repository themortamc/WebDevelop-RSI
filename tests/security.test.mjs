import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { productSearchFilter, imageUploadError, MAX_IMAGE_BYTES } from '../src/lib/security.ts';

test('search values cannot inject PostgREST grammar or wildcard bulk edits', async () => {
  const db = new PGlite();
  try {
    for (const term of ['freno', '1,6/1,8', 'x),published.eq.true', 'a"b\\c', '%', '_', '*', '(a+)+$', '[]{}.^$|?', 'Citroën']) {
      const filter = productSearchFilter(term);
      // Consume the ENTIRE expression with exactly three fixed operators and
      // double-quoted values. Commas/parentheses inside input stay in values.
      const value = '"((?:[^"\\\\]|\\\\.)*)"';
      const match = filter.match(new RegExp(`^name\\.imatch\\.${value},brand\\.imatch\\.${value},sku\\.imatch\\.${value}$`));
      assert.ok(match, filter);
      assert.equal(match[1], match[2]);
      assert.equal(match[2], match[3]);
      const regex = match[1].replace(/\\(.)/g, '$1');
      const { rows } = await db.query('select $1 ~* $2 as matches, $3 ~* $2 as unrelated', [`prefix ${term} suffix`, regex, 'unrelated product']);
      assert.equal(rows[0].matches, true, term);
      assert.equal(rows[0].unrelated, false, term);
    }
    assert.equal(productSearchFilter(' Freno '), 'name.imatch."Freno",brand.imatch."Freno",sku.imatch."Freno"');
    assert.ok(productSearchFilter('motor', true).includes('description.imatch."motor"'));
  } finally {
    await db.close();
  }
});

test('upload validation rejects active formats, spoofed type keys and oversized files', () => {
  for (const type of ['image/svg+xml', 'text/html', 'image/bmp', '', 'toString', '__proto__']) {
    assert.ok(imageUploadError({ type, size: 100 }));
  }
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']) {
    assert.equal(imageUploadError({ type, size: MAX_IMAGE_BYTES }), null);
    assert.ok(imageUploadError({ type, size: MAX_IMAGE_BYTES + 1 }));
    assert.ok(imageUploadError({ type, size: 0 }));
  }
});
