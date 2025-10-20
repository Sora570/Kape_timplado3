# Product Management Interface Update - Editable Size, Unit, Price

## Tasks to Complete

- [ ] Update DB schema: Add `unit_id` column to `product_prices` table
- [ ] Modify `products_getAll.php` to join with `product_units` and return prices per size-unit
- [ ] Update `product_prices_set.php` to handle `unit_id` in inserts/updates
- [ ] Change `ProductManagement.js` `renderProducts` to use dropdowns/inputs instead of text
- [ ] Add event listeners: On size/unit change, fetch existing price (or blank if none); on price input change, save dynamically
- [ ] Filter unit dropdown to only "oz" and "piece"
- [ ] Execute schema update to add `unit_id` to `product_prices`
- [ ] Test interface: Change size/unit, verify price fetch; edit price, verify save
- [ ] Ensure backward compatibility with existing data
