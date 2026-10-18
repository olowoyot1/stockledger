/* StockLedger i18n — English, Igbo, Yorùbá, Hausa, Naijá (Nigerian Pidgin).
 * Static markup uses data-i18n / data-i18n-placeholder / data-i18n-aria / data-i18n-title.
 * Scripts call I18N.t(key, {vars}). Missing keys fall back to English, then to the key itself.
 * User data (product names, categories, customer names) is never translated.
 * Translations should be reviewed by native speakers before a public launch. */
(function (root) {
  'use strict';

  const LANGS = { en: 'English', ig: 'Igbo', yo: 'Yorùbá', ha: 'Hausa', pcm: 'Naijá (Pidgin)' };

  const en = {
    'app.title': 'StockLedger — Sales & Stock', 'app.subtitle': 'Sales & Stock Control', 'app.brand': 'My Business',
    'lang.label': 'Language', 'skip': 'Skip to content',
    'common.logout': 'Logout', 'common.cancel': 'Cancel', 'common.save': 'Save', 'common.remove': 'Remove', 'common.edit': 'Edit', 'common.wait': 'Please wait…',
    'nav.aria': 'Main', 'nav.sales': 'Daily Sales', 'nav.products': 'Products', 'nav.reports': 'Reports', 'nav.analytics': 'Analytics',
    'nav.credit': 'Credit & Debtors', 'nav.import': 'Excel Import', 'nav.settings': 'Settings', 'nav.companies': 'Companies',

    'login.eyebrow': 'StockLedger for growing businesses', 'login.headline': 'Know what sold. Know what’s left.',
    'login.lead': 'Track daily sales, stock, credit and debtors in one calm, practical workspace.',
    'login.p1': 'Daily stock control', 'login.p2': 'Simple staff access', 'login.p3': 'Clear pricing',
    'login.tagline': 'Sales, stock & credit tracking for your business', 'login.startFree': 'Start free',
    'login.pricing': '14 days free, then ₦{price} per user/month.', 'login.tabIn': 'Sign in', 'login.tabUp': 'Start free trial',
    'login.business': 'Business name', 'login.user': 'Email or username', 'login.password': 'Password', 'login.passwordHint': 'At least 8 characters',
    'login.submitIn': 'Sign in', 'login.submitUp': 'Create account', 'login.hint': '14-day free trial, then ₦{price} per user / month. No card required.',

    'status.saved': 'All changes saved', 'status.saving': 'Saving…', 'status.storageFull': 'Save failed — storage full',
    'status.cloudSaved': 'Cloud saved', 'status.cloudFailed': 'Cloud save failed — retry required', 'status.cloudLoaded': 'Cloud data loaded',
    'status.cloudOffline': 'Cloud sync unavailable — local changes are kept', 'status.readOnly': 'Read-only — subscription ended',
    'toast.storageFull': 'Could not save. Free up browser storage.',
    'acct.superadmin': 'Superadmin', 'acct.trialLeft': 'Trial: {n} days left', 'acct.ended': 'Subscription ended (read-only)',
    'acct.banner': 'Your trial or subscription has ended. You can view and export your data, but changes cannot be saved until you renew.',
    'acct.readOnlyToast': 'Read-only: renew your subscription to make changes.',

    'sales.title': 'Daily Sales', 'sales.help': 'Opening + additions − closing = units sold.', 'sales.toolbar': 'Day actions',
    'sales.date': 'Business date', 'sales.changeDate': 'Change Date', 'sales.clone': 'Clone Report', 'sales.clear': 'Clear Data',
    'sales.editDay': 'Edit Day', 'sales.saveDay': 'Save Day', 'sales.updateDay': 'Update Day',
    'sales.locked': 'This day is saved and locked. Click “Edit Day” to correct entries or add missed sales.',
    'sales.tableTitle': 'Stock & Sales', 'sales.search': 'Search product…', 'sales.searchAria': 'Search products',
    'sales.empty': 'No products found.', 'sales.qty': 'Qty', 'sales.add': 'Add', 'sales.unitsSold': '{n} units sold',
    'sales.ariaSold': 'Units sold for {name}', 'sales.ariaAdd': 'Add units sold for {name}',
    'm.sales': 'Sales', 'm.units': 'Units Sold', 'm.added': 'Stock Added', 'm.closing': 'Closing Stock',
    'col.category': 'Category', 'col.product': 'Product', 'col.opening': 'Opening', 'col.additions': 'Additions', 'col.available': 'Available',
    'col.closing': 'Closing', 'col.sold': 'Sold', 'col.addSale': 'Add Sale', 'col.unitPrice': 'Unit Price', 'col.sales': 'Sales',
    'col.sku': 'SKU', 'col.openingStock': 'Opening Stock', 'col.actions': 'Actions', 'col.date': 'Date',
    'sales.onlyLeft': 'Only {n} {name} left in stock', 'sales.addedSold': 'Added {n} sold: {name}', 'sales.clickEdit': 'Click Edit Day to add sales',
    'sales.editing': 'Editing {date} — changes auto-save', 'sales.pickDifferent': 'Pick a different date to clone to',
    'sales.nothing': 'Nothing recorded on {date} yet', 'sales.nothingClear': 'Nothing to clear for {date}',
    'sales.replaceClone': 'A report already exists for {to}. Replace it with a copy of {from}?', 'sales.replaceMove': 'A report already exists for {to}. Replace it?',
    'sales.cloned': 'Report cloned to {date}', 'sales.moved': 'Report moved to {date}',
    'sales.clearConfirm': 'Clear all data for {date}? This deletes this day’s entries and saved report so you can start fresh.', 'sales.cleared': 'Data cleared for {date}',
    'sales.saved': 'Daily report saved', 'sales.updated': 'Daily report updated',
    'dlg.moveTitle': 'Change business date', 'dlg.cloneTitle': 'Clone report', 'dlg.current': 'Current date: {date}',
    'dlg.cloneHelp': 'Copy all entries from {date} to a new date. The original stays unchanged.', 'dlg.newDate': 'New date',
    'dlg.move': 'Move Report', 'dlg.clone': 'Clone Report',

    'products.title': 'Products', 'products.help': 'Manage products, prices and opening stock.', 'products.add': '+ Add Product',
    'products.confirmRemove': 'Remove this product?', 'products.removed': 'Product removed', 'products.added': 'Product added', 'products.updated': 'Product updated',
    'products.nameRequired': 'Product name cannot be empty', 'products.duplicate': 'A product named “{name}” already exists',
    'products.priceUpdated': 'Price updated. Past reports keep their original prices.', 'products.priceSynced': 'Unit price updated on Products too',
    'products.empty': 'No products yet. Add one or import a list.', 'products.ariaCategory': 'Category for {name}',
    'products.newTitle': 'Add product', 'products.name': 'Product name', 'products.category': 'Category', 'products.price': 'Unit price', 'products.opening': 'Opening stock',

    'reports.title': 'Reports', 'reports.help': 'Review saved days or generate a custom period.', 'reports.from': 'From', 'reports.to': 'To',
    'reports.generate': 'Generate Report', 'reports.exportCsv': 'Export CSV', 'reports.exportAll': 'Export All CSV', 'reports.history': 'Product History',
    'reports.saved': 'Saved Daily Reports', 'reports.none': 'No saved reports yet.', 'reports.totalSales': 'Total Sales', 'reports.savedDays': 'Saved Days',
    'reports.topProducts': 'Top Products', 'reports.categorySales': 'Category Sales', 'reports.noData': 'No data.', 'reports.currentPrice': 'Current Price',
    'reports.totalUnits': 'Total Units Sold', 'reports.priceChanges': 'Price Changes', 'reports.noPriceChanges': 'No price changes recorded yet.',
    'reports.via': 'via {src}', 'reports.was': 'was {price}', 'reports.noActivity': 'No recorded activity for this product yet.', 'reports.noProducts': 'No products.',
    'reports.chooseProduct': 'Choose product', 'reports.rangeTooLong': 'Choose a range of 5 years or less.', 'reports.draft': 'Draft',
    'col.action': 'Action', 'src.daily': 'Daily Sales', 'src.products': 'Products page', 'src.import': 'Excel import',

    'an.title': 'Sales Analytics', 'an.help': 'Sales trends and product performance.', 'an.lastN': 'Last {n} days', 'an.period': 'Period Sales',
    'an.avg': 'Average Daily Sales', 'an.best': 'Best Sales Day', 'an.trend': 'Daily Sales Trend', 'an.top': 'Top Products',
    'an.cat': 'Category Performance', 'an.qty': '{n} qty sold', 'an.none': 'No saved sales.',

    'imp.title': 'Excel Import', 'imp.help': 'Import or update your stock list from Excel/CSV.', 'imp.upload': 'Upload Stock List', 'imp.button': 'Import File',
    'imp.required': 'Required columns', 'imp.optional': 'Optional: SKU. Any category name works (for example Drinks, Snacks, Bread). Column headings must be in English.',
    'imp.template': 'Download Template', 'imp.select': 'Select a file first', 'imp.tooBig': 'File is too large (maximum 5 MB).', 'imp.noRows': 'No product rows found',
    'imp.cols': 'Required columns: Category, Product, Unit Price, Opening Stock', 'imp.done': '{n} product(s) imported successfully.',
    'imp.failed': 'Import failed: {msg}', 'imp.complete': 'Import complete', 'imp.tooMany': 'Too many rows (maximum 5,000).', 'imp.reader': 'Could not load the Excel reader. Use CSV or refresh the page.',

    'set.title': 'Settings', 'set.help': 'Change your login and password, and choose your language.', 'set.username': 'Username', 'set.currentPw': 'Current password',
    'set.newPw': 'New password', 'set.confirmPw': 'Confirm password', 'set.save': 'Save Login Settings', 'set.required': 'Username and current password are required.',
    'set.pwLength': 'New password must be 8–128 characters.', 'set.mismatch': 'Password confirmation does not match.', 'set.updating': 'Updating…',
    'set.updated': 'Login settings updated.', 'set.dataTitle': 'Data', 'set.dataHelp': 'Entries save instantly on this device and sync to the cloud. Export CSV regularly as a backup.',
    'set.reset': 'Reset App Data', 'set.resetConfirm': 'Reset all products, reports and credit records on every device? This cannot be undone. Export CSV first if you need a backup.',
    'set.resetDone': 'All data reset', 'set.logoutFail': 'Could not confirm the cloud save. Log out anyway? Unsynced changes on this device will be lost.',

    'team.title': 'Team & billing', 'team.one': '1 user × {price} = {total} per month', 'team.many': '{n} users × {price} = {total} per month',
    'team.trialFree': ' (free during your trial)', 'team.staffLogin': 'Staff login', 'team.staffPw': 'Staff password', 'team.add': 'Add user ({price} / month)',
    'team.none': 'No staff users yet — you are the only user.', 'team.added': 'User added.', 'team.confirmRemove': 'Remove this user? They will no longer be able to sign in.',

    'co.title': 'Companies', 'co.help': 'Every business registered in StockLedger.', 'co.refresh': 'Refresh', 'co.business': 'Business', 'co.owner': 'Owner login',
    'co.plan': 'Plan', 'co.staff': 'Staff', 'co.joined': 'Joined', 'co.loading': 'Loading companies…', 'co.one': '1 company found.', 'co.many': '{n} companies found.',
    'co.none': 'No companies found.', 'plan.trial': 'Trial', 'plan.active': 'Active subscription', 'plan.suspended': 'Suspended',

    'cr.title': 'Credit Sales & Debtors', 'cr.totalCredit': 'Total Credit Sales', 'cr.totalPaid': 'Total Payments', 'cr.outstanding': 'Outstanding', 'cr.customers': 'Customers',
    'cr.tabDebtors': 'Debtors', 'cr.tabSale': 'New Credit Sale', 'cr.tabPay': 'Record Payment', 'cr.register': 'Debtor Register', 'cr.name': 'Customer name',
    'cr.phone': 'Phone', 'cr.address': 'Address', 'cr.limit': 'Credit limit', 'cr.openingBal': 'Opening balance (existing debt)', 'cr.notes': 'Notes',
    'cr.addDebtor': 'Add Debtor', 'cr.customer': 'Customer', 'cr.creditSales': 'Credit Sales', 'cr.payments': 'Payments', 'cr.balance': 'Balance', 'cr.ledger': 'Ledger',
    'cr.noDebtors': 'No customers yet.', 'cr.selectCustomer': 'Select customer', 'cr.selectProduct': 'Select product', 'cr.qty': 'Quantity', 'cr.unitPrice': 'Unit price',
    'cr.amountPaid': 'Amount paid now', 'cr.dueDate': 'Due date', 'cr.saveSale': 'Save Credit Sale', 'cr.amount': 'Amount', 'cr.date': 'Date', 'cr.method': 'Method',
    'cr.reference': 'Reference', 'cr.savePay': 'Save Payment', 'cr.cash': 'Cash', 'cr.transfer': 'Transfer', 'cr.pos': 'POS', 'cr.other': 'Other',
    'cr.nameReq': 'Customer name is required.', 'cr.saleInvalid': 'Select a customer, product and valid quantity.', 'cr.overSale': 'Payment cannot exceed the sale amount.',
    'cr.saleDone': 'Credit sale recorded. Outstanding: {amount}', 'cr.overLimit': 'This sale takes {name} to {balance}, above the credit limit of {limit}. Continue?',
    'cr.payInvalid': 'Select a customer and enter a valid amount.', 'cr.overBalance': 'This payment is more than the {balance} owed. Record it anyway?',
    'cr.payDone': 'Payment recorded', 'cr.debtorAdded': 'Customer added', 'cr.back': '← Back', 'cr.ledgerTitle': '{name} — Customer Ledger',
    'cr.phoneAddr': 'Phone: {phone} · Address: {address}', 'cr.balanceLine': 'Outstanding Balance: {amount}', 'cr.type': 'Type', 'cr.debit': 'Debit', 'cr.creditCol': 'Credit',
    'cr.typeSale': 'Credit Sale', 'cr.typePay': 'Payment', 'cr.typeOpen': 'Opening balance', 'cr.atSale': 'At sale', 'cr.paymentAtSale': 'Payment against credit sale',

    'err.AUTH_REQUIRED': 'Your session has expired. Please sign in again.', 'err.LOGIN_INVALID': 'Invalid login or password.',
    'err.RATE_LIMITED': 'Too many attempts. Please wait a while and try again.', 'err.BUSINESS_NAME': 'Enter your business name (2–80 characters).',
    'err.USERNAME_INVALID': 'Login must be 3–100 characters with no spaces.', 'err.PASSWORD_INVALID': 'Password must be 8–128 characters.',
    'err.USERNAME_TAKEN': 'That login is already taken.', 'err.FORBIDDEN': 'You do not have permission to do that.',
    'err.SUBSCRIPTION_ENDED': 'Your trial or subscription has ended. Renew to keep saving changes.', 'err.PAYLOAD_TOO_LARGE': 'Data is too large. Export older reports and try again.',
    'err.CONFLICT': 'Another device saved at the same time. Please try again.', 'err.RESET': 'Data was reset on another device. Reloading…',
    'err.BAD_REQUEST': 'That request was not valid.', 'err.STAFF_LIMIT': 'Staff limit reached.', 'err.SERVER_ERROR': 'Something went wrong on our side. Please try again.',
    'err.NETWORK': 'Could not reach the server. Check your connection.'
  };

  const ig = {
    'app.title': 'StockLedger — Ire Ahịa na Ngwongwo', 'app.subtitle': 'Njikwa Ire Ahịa na Ngwongwo', 'app.brand': 'Azụmahịa m',
    'lang.label': 'Asụsụ', 'skip': 'Gafee gaa n’ọdịnaya',
    'common.logout': 'Pụọ', 'common.cancel': 'Kagbuo', 'common.save': 'Chekwaa', 'common.remove': 'Wepụ', 'common.edit': 'Dezie', 'common.wait': 'Biko chere…',
    'nav.aria': 'Isi', 'nav.sales': 'Ire Ahịa Kwa Ụbọchị', 'nav.products': 'Ngwaahịa', 'nav.reports': 'Akụkọ', 'nav.analytics': 'Nyocha',
    'nav.credit': 'Ụgwọ na Ndị Ji Ụgwọ', 'nav.import': 'Ibubata Excel', 'nav.settings': 'Ntọala', 'nav.companies': 'Ụlọ Ọrụ',

    'login.eyebrow': 'StockLedger maka azụmahịa na-eto eto', 'login.headline': 'Mara ihe ere. Mara ihe fọdụrụ.',
    'login.lead': 'Soro ire ahịa kwa ụbọchị, ngwongwo, ire ahịa n’ụgwọ na ndị ji ụgwọ n’otu ebe dị mfe.',
    'login.p1': 'Njikwa ngwongwo kwa ụbọchị', 'login.p2': 'Ohere dị mfe maka ndị ọrụ', 'login.p3': 'Ọnụ ahịa doro anya',
    'login.tagline': 'Soro ire ahịa, ngwongwo na ụgwọ nke azụmahịa gị', 'login.startFree': 'Malite n’efu',
    'login.pricing': 'Ụbọchị 14 n’efu, ma emesịa ₦{price} n’otu onye n’ọnwa.', 'login.tabIn': 'Banye', 'login.tabUp': 'Malite nnwale n’efu',
    'login.business': 'Aha azụmahịa', 'login.user': 'Email ma ọ bụ aha njirimara', 'login.password': 'Paswọọdụ', 'login.passwordHint': 'Opekata mpe mkpụrụedemede 8',
    'login.submitIn': 'Banye', 'login.submitUp': 'Mepụta akaụntụ', 'login.hint': 'Nnwale ụbọchị 14 n’efu, ma emesịa ₦{price} n’otu onye n’ọnwa. Ọ dịghị kaadị achọrọ.',

    'status.saved': 'Echekwara mgbanwe niile', 'status.saving': 'Na-echekwa…', 'status.storageFull': 'Ọ dịghị echekwa — ebe nchekwa jupụtara',
    'status.cloudSaved': 'Echekwara n’ịntanetị', 'status.cloudFailed': 'Nchekwa n’ịntanetị emeghị — nwaa ọzọ', 'status.cloudLoaded': 'Ebudatara data site n’ịntanetị',
    'status.cloudOffline': 'Njikọ ịntanetị adịghị — echekwara mgbanwe gị n’ekwentị', 'status.readOnly': 'Ọ bụ ịgụ naanị — nrịgo agwụla',
    'toast.storageFull': 'Enweghị ike ichekwa. Mee ohere n’ebe nchekwa ekwentị.',
    'acct.superadmin': 'Onye isi nchịkwa', 'acct.trialLeft': 'Nnwale: ụbọchị {n} fọdụrụ', 'acct.ended': 'Nrịgo agwụla (ịgụ naanị)',
    'acct.banner': 'Nnwale gị ma ọ bụ nrịgo gị agwụla. Ị nwere ike ịhụ ma bupụ data gị, mana ị nweghị ike ichekwa mgbanwe ruo mgbe ị kwụghachiri.',
    'acct.readOnlyToast': 'Ịgụ naanị: kwụghachi ụgwọ nrịgo ka ị gbanwee ihe.',

    'sales.title': 'Ire Ahịa Kwa Ụbọchị', 'sales.help': 'Mmalite + ihe ahụ gbakwunyere − mmechi = ọnụọgụ ere.', 'sales.toolbar': 'Ọrụ ụbọchị',
    'sales.date': 'Ụbọchị azụmahịa', 'sales.changeDate': 'Gbanwee Ụbọchị', 'sales.clone': 'Detuo Akụkọ', 'sales.clear': 'Hichaa Data',
    'sales.editDay': 'Dezie Ụbọchị', 'sales.saveDay': 'Chekwaa Ụbọchị', 'sales.updateDay': 'Melite Ụbọchị',
    'sales.locked': 'Echekwara ụbọchị a ma mechie ya. Pịa “Dezie Ụbọchị” ka ị dozie ihe edere ma ọ bụ tinye ire ahịa hapụrụ.',
    'sales.tableTitle': 'Ngwongwo na Ire Ahịa', 'sales.search': 'Chọọ ngwaahịa…', 'sales.searchAria': 'Chọọ ngwaahịa',
    'sales.empty': 'Achọtaghị ngwaahịa ọ bụla.', 'sales.qty': 'Ọnụọgụ', 'sales.add': 'Tinye', 'sales.unitsSold': '{n} ere',
    'sales.ariaSold': 'Ọnụọgụ ere maka {name}', 'sales.ariaAdd': 'Tinye ọnụọgụ ere maka {name}',
    'm.sales': 'Ire Ahịa', 'm.units': 'Ọnụọgụ Ere', 'm.added': 'Ngwongwo Agbakwunyere', 'm.closing': 'Ngwongwo Fọdụrụ',
    'col.category': 'Ụdị', 'col.product': 'Ngwaahịa', 'col.opening': 'Mmalite', 'col.additions': 'Mgbakwunye', 'col.available': 'Dị',
    'col.closing': 'Mmechi', 'col.sold': 'Ere', 'col.addSale': 'Tinye Ire', 'col.unitPrice': 'Ọnụ Ahịa Otu', 'col.sales': 'Ire Ahịa',
    'col.sku': 'SKU', 'col.openingStock': 'Ngwongwo Mmalite', 'col.actions': 'Ọrụ', 'col.date': 'Ụbọchị',
    'sales.onlyLeft': 'Naanị {n} {name} fọdụrụ', 'sales.addedSold': 'Etinyere {n} ere: {name}', 'sales.clickEdit': 'Pịa Dezie Ụbọchị ka ị tinye ire ahịa',
    'sales.editing': 'Na-edezi {date} — a na-echekwa mgbanwe n’onwe ya', 'sales.pickDifferent': 'Họrọ ụbọchị ọzọ ka ị detuo ya',
    'sales.nothing': 'Ọ dịghị ihe edere na {date}', 'sales.nothingClear': 'Ọ dịghị ihe ị ga-ehichapụ na {date}',
    'sales.replaceClone': 'Akụkọ adịlarị maka {to}. Ọ dị ka ị chọrọ iji ndetu nke {from} dochie ya?', 'sales.replaceMove': 'Akụkọ adịlarị maka {to}. Dochie ya?',
    'sales.cloned': 'Edetuola akụkọ gaa {date}', 'sales.moved': 'Edugharịala akụkọ gaa {date}',
    'sales.clearConfirm': 'Hichapụ data niile nke {date}? Nke a ga-ehichapụ ihe edere na akụkọ echekwara nke ụbọchị a ka ị malite ọzọ.', 'sales.cleared': 'Ehichapụla data nke {date}',
    'sales.saved': 'Echekwara akụkọ ụbọchị', 'sales.updated': 'Emelitela akụkọ ụbọchị',
    'dlg.moveTitle': 'Gbanwee ụbọchị azụmahịa', 'dlg.cloneTitle': 'Detuo akụkọ', 'dlg.current': 'Ụbọchị ugbu a: {date}',
    'dlg.cloneHelp': 'Detuo ihe niile site na {date} gaa ụbọchị ọhụrụ. Nke mbụ agaghị agbanwe.', 'dlg.newDate': 'Ụbọchị ọhụrụ',
    'dlg.move': 'Dugharịa Akụkọ', 'dlg.clone': 'Detuo Akụkọ',

    'products.title': 'Ngwaahịa', 'products.help': 'Jikwaa ngwaahịa, ọnụ ahịa na ngwongwo mmalite.', 'products.add': '+ Tinye Ngwaahịa',
    'products.confirmRemove': 'Wepụ ngwaahịa a?', 'products.removed': 'Ewepụla ngwaahịa', 'products.added': 'Etinyela ngwaahịa', 'products.updated': 'Emelitela ngwaahịa',
    'products.nameRequired': 'Aha ngwaahịa enweghị ike ịbụ ihe efu', 'products.duplicate': 'Ngwaahịa aha ya bụ “{name}” adịlarị',
    'products.priceUpdated': 'Emelitela ọnụ ahịa. Akụkọ gara aga ga-ejigide ọnụ ahịa mbụ ha.', 'products.priceSynced': 'Emelitekwara ọnụ ahịa na ibe Ngwaahịa',
    'products.empty': 'Ọ dịbeghị ngwaahịa. Tinye otu ma ọ bụ buba ndepụta.', 'products.ariaCategory': 'Ụdị maka {name}',
    'products.newTitle': 'Tinye ngwaahịa', 'products.name': 'Aha ngwaahịa', 'products.category': 'Ụdị', 'products.price': 'Ọnụ ahịa otu', 'products.opening': 'Ngwongwo mmalite',

    'reports.title': 'Akụkọ', 'reports.help': 'Lelee ụbọchị echekwara ma ọ bụ mepụta akụkọ oge ị chọrọ.', 'reports.from': 'Site na', 'reports.to': 'Ruo',
    'reports.generate': 'Mepụta Akụkọ', 'reports.exportCsv': 'Bupụ CSV', 'reports.exportAll': 'Bupụ CSV Niile', 'reports.history': 'Akụkọ Ngwaahịa',
    'reports.saved': 'Akụkọ Ụbọchị Echekwara', 'reports.none': 'Ọ dịbeghị akụkọ echekwara.', 'reports.totalSales': 'Ngụkọta Ire Ahịa', 'reports.savedDays': 'Ụbọchị Echekwara',
    'reports.topProducts': 'Ngwaahịa Kacha Ere', 'reports.categorySales': 'Ire Ahịa dị ka Ụdị', 'reports.noData': 'Ọ dịghị data.', 'reports.currentPrice': 'Ọnụ Ahịa Ugbu a',
    'reports.totalUnits': 'Ngụkọta Ọnụọgụ Ere', 'reports.priceChanges': 'Mgbanwe Ọnụ Ahịa', 'reports.noPriceChanges': 'Ọ dịbeghị mgbanwe ọnụ ahịa edere.',
    'reports.via': 'site na {src}', 'reports.was': 'bụ {price}', 'reports.noActivity': 'Ọ dịbeghị ihe edere maka ngwaahịa a.', 'reports.noProducts': 'Ọ dịghị ngwaahịa.',
    'reports.chooseProduct': 'Họrọ ngwaahịa', 'reports.rangeTooLong': 'Họrọ oge nke afọ 5 ma ọ bụ obere.', 'reports.draft': 'Ndepụta',
    'col.action': 'Ọrụ', 'src.daily': 'Ire Ahịa Kwa Ụbọchị', 'src.products': 'Ibe Ngwaahịa', 'src.import': 'Ibubata Excel',

    'an.title': 'Nyocha Ire Ahịa', 'an.help': 'Ọnọdụ ire ahịa na otú ngwaahịa si eme.', 'an.lastN': 'Ụbọchị {n} gara aga', 'an.period': 'Ire Ahịa Oge a',
    'an.avg': 'Ire Ahịa Nkezi Kwa Ụbọchị', 'an.best': 'Ụbọchị Ire Ahịa Kacha Mma', 'an.trend': 'Ọnọdụ Ire Ahịa Kwa Ụbọchị', 'an.top': 'Ngwaahịa Kacha Ere',
    'an.cat': 'Otú Ụdị Si Eme', 'an.qty': '{n} ere', 'an.none': 'Ọ dịghị ire ahịa echekwara.',

    'imp.title': 'Ibubata Excel', 'imp.help': 'Buba ma ọ bụ melite ndepụta ngwongwo gị site na Excel/CSV.', 'imp.upload': 'Bulite Ndepụta Ngwongwo', 'imp.button': 'Buba Faịlụ',
    'imp.required': 'Ogidi achọrọ', 'imp.optional': 'Nhọrọ: SKU. Aha ụdị ọ bụla adị mma (dị ka Drinks, Snacks, Bread). Isiokwu ogidi ga-abụ n’Bekee.',
    'imp.template': 'Budata Ihe Nlereanya', 'imp.select': 'Buru ụzọ họrọ faịlụ', 'imp.tooBig': 'Faịlụ buru oke ibu (kacha 5 MB).', 'imp.noRows': 'Achọtaghị ahịrị ngwaahịa',
    'imp.cols': 'Ogidi achọrọ: Category, Product, Unit Price, Opening Stock', 'imp.done': 'Ebubatara ngwaahịa {n} nke ọma.',
    'imp.failed': 'Ibubata emeghị: {msg}', 'imp.complete': 'Ibubata zuru ezu', 'imp.tooMany': 'Ahịrị dị ọtụtụ (kacha 5,000).', 'imp.reader': 'Enweghị ike ibudata ihe na-agụ Excel. Jiri CSV ma ọ bụ megharịa ibe a.',

    'set.title': 'Ntọala', 'set.help': 'Gbanwee aha njirimara na paswọọdụ gị, ma họrọ asụsụ gị.', 'set.username': 'Aha njirimara', 'set.currentPw': 'Paswọọdụ ugbu a',
    'set.newPw': 'Paswọọdụ ọhụrụ', 'set.confirmPw': 'Kwenye paswọọdụ', 'set.save': 'Chekwaa Ntọala Nbanye', 'set.required': 'Aha njirimara na paswọọdụ ugbu a dị mkpa.',
    'set.pwLength': 'Paswọọdụ ọhụrụ ga-abụ mkpụrụedemede 8–128.', 'set.mismatch': 'Nkwenye paswọọdụ adabaghị.', 'set.updating': 'Na-emelite…',
    'set.updated': 'Emelitela ntọala nbanye.', 'set.dataTitle': 'Data', 'set.dataHelp': 'A na-echekwa ihe ị dere ozugbo n’ekwentị gị ma ziga ya n’ịntanetị. Bupụ CSV mgbe niile dị ka nchekwa.',
    'set.reset': 'Hichaa Data Niile', 'set.resetConfirm': 'Hichapụ ngwaahịa, akụkọ na ndekọ ụgwọ niile n’ngwaọrụ niile? Enweghị ike ịlaghachi azụ. Buru ụzọ bupụ CSV ma ọ bụrụ na ịchọrọ nchekwa.',
    'set.resetDone': 'Ehichapụla data niile', 'set.logoutFail': 'Enweghị ike ịkwenye nchekwa n’ịntanetị. Pụọ n’agbanyeghị? Mgbanwe ndị a na-ezughị ezu n’ekwentị a ga-efu.',

    'team.title': 'Otu na Ịkwụ Ụgwọ', 'team.one': 'Onye 1 × {price} = {total} n’ọnwa', 'team.many': 'Ndị {n} × {price} = {total} n’ọnwa',
    'team.trialFree': ' (n’efu n’oge nnwale gị)', 'team.staffLogin': 'Aha nbanye onye ọrụ', 'team.staffPw': 'Paswọọdụ onye ọrụ', 'team.add': 'Tinye onye ọrụ ({price} / ọnwa)',
    'team.none': 'Ọ dịbeghị onye ọrụ — ị bụ naanị onye na-eji ya.', 'team.added': 'Etinyela onye ọrụ.', 'team.confirmRemove': 'Wepụ onye a? Ọ gaghị enwe ike ibanye ọzọ.',

    'co.title': 'Ụlọ Ọrụ', 'co.help': 'Azụmahịa niile edebanyere aha na StockLedger.', 'co.refresh': 'Megharịa', 'co.business': 'Azụmahịa', 'co.owner': 'Aha nbanye onye nwe ya',
    'co.plan': 'Atụmatụ', 'co.staff': 'Ndị ọrụ', 'co.joined': 'Ọ sonyere', 'co.loading': 'Na-ebudata ụlọ ọrụ…', 'co.one': 'Achọtara ụlọ ọrụ 1.', 'co.many': 'Achọtara ụlọ ọrụ {n}.',
    'co.none': 'Achọtaghị ụlọ ọrụ ọ bụla.', 'plan.trial': 'Nnwale', 'plan.active': 'Nrịgo na-arụ ọrụ', 'plan.suspended': 'Akwụsịrị',

    'cr.title': 'Ire Ahịa n’Ụgwọ na Ndị Ji Ụgwọ', 'cr.totalCredit': 'Ngụkọta Ire Ahịa n’Ụgwọ', 'cr.totalPaid': 'Ngụkọta Ụgwọ Akwụrụ', 'cr.outstanding': 'Ụgwọ Fọdụrụ', 'cr.customers': 'Ndị Ahịa',
    'cr.tabDebtors': 'Ndị Ji Ụgwọ', 'cr.tabSale': 'Ire Ahịa n’Ụgwọ Ọhụrụ', 'cr.tabPay': 'Dee Ụgwọ Akwụrụ', 'cr.register': 'Ndekọ Ndị Ji Ụgwọ', 'cr.name': 'Aha onye ahịa',
    'cr.phone': 'Ekwentị', 'cr.address': 'Adreesị', 'cr.limit': 'Oke ụgwọ', 'cr.openingBal': 'Ụgwọ mmalite (ụgwọ dị adị)', 'cr.notes': 'Nkọwa',
    'cr.addDebtor': 'Tinye Onye Ji Ụgwọ', 'cr.customer': 'Onye ahịa', 'cr.creditSales': 'Ire Ahịa n’Ụgwọ', 'cr.payments': 'Ụgwọ Akwụrụ', 'cr.balance': 'Fọdụrụ', 'cr.ledger': 'Akwụkwọ Ndekọ',
    'cr.noDebtors': 'Ọ dịbeghị onye ahịa.', 'cr.selectCustomer': 'Họrọ onye ahịa', 'cr.selectProduct': 'Họrọ ngwaahịa', 'cr.qty': 'Ọnụọgụ', 'cr.unitPrice': 'Ọnụ ahịa otu',
    'cr.amountPaid': 'Ego akwụrụ ugbu a', 'cr.dueDate': 'Ụbọchị ịkwụ', 'cr.saveSale': 'Chekwaa Ire Ahịa n’Ụgwọ', 'cr.amount': 'Ego', 'cr.date': 'Ụbọchị', 'cr.method': 'Ụzọ',
    'cr.reference': 'Ntụaka', 'cr.savePay': 'Chekwaa Ụgwọ Akwụrụ', 'cr.cash': 'Ego aka', 'cr.transfer': 'Mbufe', 'cr.pos': 'POS', 'cr.other': 'Ọzọ',
    'cr.nameReq': 'Aha onye ahịa dị mkpa.', 'cr.saleInvalid': 'Họrọ onye ahịa, ngwaahịa na ọnụọgụ ziri ezi.', 'cr.overSale': 'Ego akwụrụ enweghị ike ịkarị ọnụ ahịa ire.',
    'cr.saleDone': 'Edere ire ahịa n’ụgwọ. Fọdụrụ: {amount}', 'cr.overLimit': 'Ire a ga-eme ka {name} ji {balance}, nke karịrị oke ụgwọ {limit}. Gaa n’ihu?',
    'cr.payInvalid': 'Họrọ onye ahịa ma tinye ego ziri ezi.', 'cr.overBalance': 'Ụgwọ a karịrị {balance} o ji. Dee ya n’agbanyeghị?',
    'cr.payDone': 'Edere ụgwọ akwụrụ', 'cr.debtorAdded': 'Etinyela onye ahịa', 'cr.back': '← Laghachi', 'cr.ledgerTitle': '{name} — Akwụkwọ Ndekọ Onye Ahịa',
    'cr.phoneAddr': 'Ekwentị: {phone} · Adreesị: {address}', 'cr.balanceLine': 'Ụgwọ Fọdụrụ: {amount}', 'cr.type': 'Ụdị', 'cr.debit': 'Ụgwọ Gbakwunyere', 'cr.creditCol': 'Ụgwọ Akwụrụ',
    'cr.typeSale': 'Ire Ahịa n’Ụgwọ', 'cr.typePay': 'Ụgwọ Akwụrụ', 'cr.typeOpen': 'Ụgwọ mmalite', 'cr.atSale': 'Mgbe a na-ere', 'cr.paymentAtSale': 'Ụgwọ akwụrụ megide ire ahịa n’ụgwọ',

    'err.AUTH_REQUIRED': 'Oge gị agwụla. Biko banye ọzọ.', 'err.LOGIN_INVALID': 'Aha njirimara ma ọ bụ paswọọdụ ezighi ezi.',
    'err.RATE_LIMITED': 'Ị nwara ọtụtụ ugboro. Biko chere ntakịrị ma nwaa ọzọ.', 'err.BUSINESS_NAME': 'Tinye aha azụmahịa gị (mkpụrụedemede 2–80).',
    'err.USERNAME_INVALID': 'Aha nbanye ga-abụ mkpụrụedemede 3–100 na-enweghị oghere.', 'err.PASSWORD_INVALID': 'Paswọọdụ ga-abụ mkpụrụedemede 8–128.',
    'err.USERNAME_TAKEN': 'Onye were aha nbanye ahụ.', 'err.FORBIDDEN': 'Ị nweghị ikike ime nke ahụ.',
    'err.SUBSCRIPTION_ENDED': 'Nnwale gị ma ọ bụ nrịgo gị agwụla. Kwụghachi ka ị nwee ike ichekwa mgbanwe.', 'err.PAYLOAD_TOO_LARGE': 'Data buru oke ibu. Bupụ akụkọ ochie ma nwaa ọzọ.',
    'err.CONFLICT': 'Ngwaọrụ ọzọ chekwara n’otu oge. Biko nwaa ọzọ.', 'err.RESET': 'Ehichapụla data n’ngwaọrụ ọzọ. Na-emegharị…',
    'err.BAD_REQUEST': 'Arịrịọ ahụ adịghị mma.', 'err.STAFF_LIMIT': 'Ruola oke ndị ọrụ.', 'err.SERVER_ERROR': 'Nsogbu mere n’akụkụ anyị. Biko nwaa ọzọ.',
    'err.NETWORK': 'Enweghị ike ịkpọtụrụ sava. Lelee njikọ gị.'
  };

  const yo = {
    'app.title': 'StockLedger — Títà àti Ọjà', 'app.subtitle': 'Ìtọ́jú Títà àti Ọjà', 'app.brand': 'Iṣẹ́ Òwò Mi',
    'lang.label': 'Èdè', 'skip': 'Lọ sí àkóónú',
    'common.logout': 'Jáde', 'common.cancel': 'Fagilé', 'common.save': 'Fi pamọ́', 'common.remove': 'Yọ kúrò', 'common.edit': 'Ṣàtúnṣe', 'common.wait': 'Jọ̀wọ́ dúró…',
    'nav.aria': 'Pàtàkì', 'nav.sales': 'Títà Ojoojúmọ́', 'nav.products': 'Àwọn Ọjà', 'nav.reports': 'Ìròyìn', 'nav.analytics': 'Ìtúpalẹ̀',
    'nav.credit': 'Gbèsè àti Onígbèsè', 'nav.import': 'Gbé Excel Wọlé', 'nav.settings': 'Ètò', 'nav.companies': 'Àwọn Ilé-iṣẹ́',

    'login.eyebrow': 'StockLedger fún àwọn iṣẹ́ òwò tó ń dàgbà', 'login.headline': 'Mọ ohun tí a tà. Mọ ohun tó kù.',
    'login.lead': 'Tọpa títà ojoojúmọ́, ọjà, títà lórí gbèsè àti àwọn onígbèsè ní ibi kan tó rọrùn.',
    'login.p1': 'Ìtọ́jú ọjà ojoojúmọ́', 'login.p2': 'Àyè rírọrùn fún òṣìṣẹ́', 'login.p3': 'Owó tó ṣe kedere',
    'login.tagline': 'Tọpa títà, ọjà àti gbèsè iṣẹ́ òwò rẹ', 'login.startFree': 'Bẹ̀rẹ̀ lọ́fẹ̀ẹ́',
    'login.pricing': 'Ọjọ́ 14 lọ́fẹ̀ẹ́, lẹ́yìn náà ₦{price} fún ẹni kọ̀ọ̀kan lóṣù.', 'login.tabIn': 'Wọlé', 'login.tabUp': 'Bẹ̀rẹ̀ àdánwò ọ̀fẹ́',
    'login.business': 'Orúkọ iṣẹ́ òwò', 'login.user': 'Ímeèlì tàbí orúkọ olùlò', 'login.password': 'Ọ̀rọ̀ aṣínà', 'login.passwordHint': 'Kò gbọdọ̀ dín ní ọ̀rọ̀ 8',
    'login.submitIn': 'Wọlé', 'login.submitUp': 'Ṣí àkọọ́lẹ̀', 'login.hint': 'Àdánwò ọjọ́ 14 lọ́fẹ̀ẹ́, lẹ́yìn náà ₦{price} fún ẹni kọ̀ọ̀kan lóṣù. Kò sí kaadi tí a nílò.',

    'status.saved': 'A ti fi gbogbo àyípadà pamọ́', 'status.saving': 'Ń fi pamọ́…', 'status.storageFull': 'Kò fi pamọ́ — ibi ìpamọ́ ti kún',
    'status.cloudSaved': 'A ti fi pamọ́ sórí íńtánẹ́ẹ̀tì', 'status.cloudFailed': 'Kò fi pamọ́ sórí íńtánẹ́ẹ̀tì — gbìyànjú lẹ́ẹ̀kan sí i', 'status.cloudLoaded': 'A ti gbé dátà wá láti íńtánẹ́ẹ̀tì',
    'status.cloudOffline': 'Kò sí íńtánẹ́ẹ̀tì — a ti fi àyípadà rẹ pamọ́ sórí fóònù', 'status.readOnly': 'Kíkà nìkan — àkókò ìforúkọsílẹ̀ ti parí',
    'toast.storageFull': 'Kò lè fi pamọ́. Dá àyè sílẹ̀ nínú ibi ìpamọ́ fóònù.',
    'acct.superadmin': 'Olórí aṣàkóso', 'acct.trialLeft': 'Àdánwò: ọjọ́ {n} ló kù', 'acct.ended': 'Ìforúkọsílẹ̀ ti parí (kíkà nìkan)',
    'acct.banner': 'Àdánwò tàbí ìforúkọsílẹ̀ rẹ ti parí. O lè wo àti gbé dátà rẹ jáde, ṣùgbọ́n a kò lè fi àyípadà pamọ́ títí o fi sọ ọ́ di tuntun.',
    'acct.readOnlyToast': 'Kíkà nìkan: sọ ìforúkọsílẹ̀ rẹ di tuntun kí o lè ṣe àyípadà.',

    'sales.title': 'Títà Ojoojúmọ́', 'sales.help': 'Ìbẹ̀rẹ̀ + àfikún − ìparí = iye tí a tà.', 'sales.toolbar': 'Iṣẹ́ ọjọ́',
    'sales.date': 'Ọjọ́ iṣẹ́ òwò', 'sales.changeDate': 'Yí Ọjọ́ Padà', 'sales.clone': 'Ṣe Ẹ̀dà Ìròyìn', 'sales.clear': 'Pa Dátà Rẹ́',
    'sales.editDay': 'Ṣàtúnṣe Ọjọ́', 'sales.saveDay': 'Fi Ọjọ́ Pamọ́', 'sales.updateDay': 'Ṣe Ọjọ́ Dọ́gba',
    'sales.locked': 'A ti fi ọjọ́ yìí pamọ́, a sì ti tì í. Tẹ “Ṣàtúnṣe Ọjọ́” láti ṣàtúnṣe àwọn àkọsílẹ̀ tàbí fi títà tí a gbàgbé kún.',
    'sales.tableTitle': 'Ọjà àti Títà', 'sales.search': 'Wá ọjà…', 'sales.searchAria': 'Wá àwọn ọjà',
    'sales.empty': 'Kò rí ọjà kankan.', 'sales.qty': 'Iye', 'sales.add': 'Fi kún', 'sales.unitsSold': '{n} ni a tà',
    'sales.ariaSold': 'Iye tí a tà fún {name}', 'sales.ariaAdd': 'Fi iye tí a tà kún fún {name}',
    'm.sales': 'Títà', 'm.units': 'Iye Tí A Tà', 'm.added': 'Ọjà Tí A Fi Kún', 'm.closing': 'Ọjà Tó Kù',
    'col.category': 'Ẹ̀ka', 'col.product': 'Ọjà', 'col.opening': 'Ìbẹ̀rẹ̀', 'col.additions': 'Àfikún', 'col.available': 'Tó wà',
    'col.closing': 'Ìparí', 'col.sold': 'Tí a tà', 'col.addSale': 'Fi Títà Kún', 'col.unitPrice': 'Owó Ẹyọ Kan', 'col.sales': 'Títà',
    'col.sku': 'SKU', 'col.openingStock': 'Ọjà Ìbẹ̀rẹ̀', 'col.actions': 'Iṣẹ́', 'col.date': 'Ọjọ́',
    'sales.onlyLeft': '{n} {name} péré ló kù', 'sales.addedSold': 'A fi {n} tí a tà kún: {name}', 'sales.clickEdit': 'Tẹ Ṣàtúnṣe Ọjọ́ láti fi títà kún',
    'sales.editing': 'Ń ṣàtúnṣe {date} — a ń fi àyípadà pamọ́ fúnra rẹ̀', 'sales.pickDifferent': 'Yan ọjọ́ mìíràn láti ṣe ẹ̀dà sí',
    'sales.nothing': 'Kò sí àkọsílẹ̀ lórí {date}', 'sales.nothingClear': 'Kò sí ohun láti pa rẹ́ lórí {date}',
    'sales.replaceClone': 'Ìròyìn ti wà fún {to}. Ṣé kí a fi ẹ̀dà {from} rọ́pò rẹ̀?', 'sales.replaceMove': 'Ìròyìn ti wà fún {to}. Ṣé kí a rọ́pò rẹ̀?',
    'sales.cloned': 'A ti ṣe ẹ̀dà ìròyìn sí {date}', 'sales.moved': 'A ti gbé ìròyìn lọ sí {date}',
    'sales.clearConfirm': 'Pa gbogbo dátà {date} rẹ́? Èyí yóò pa àwọn àkọsílẹ̀ ọjọ́ yìí àti ìròyìn tí a fi pamọ́ rẹ́ kí o lè bẹ̀rẹ̀ tuntun.', 'sales.cleared': 'A ti pa dátà {date} rẹ́',
    'sales.saved': 'A ti fi ìròyìn ojoojúmọ́ pamọ́', 'sales.updated': 'A ti ṣe ìròyìn ojoojúmọ́ dọ́gba',
    'dlg.moveTitle': 'Yí ọjọ́ iṣẹ́ òwò padà', 'dlg.cloneTitle': 'Ṣe ẹ̀dà ìròyìn', 'dlg.current': 'Ọjọ́ lọ́wọ́lọ́wọ́: {date}',
    'dlg.cloneHelp': 'Ṣe ẹ̀dà gbogbo àkọsílẹ̀ láti {date} sí ọjọ́ tuntun. Ti àkọ́kọ́ kò ní yí padà.', 'dlg.newDate': 'Ọjọ́ tuntun',
    'dlg.move': 'Gbé Ìròyìn Lọ', 'dlg.clone': 'Ṣe Ẹ̀dà Ìròyìn',

    'products.title': 'Àwọn Ọjà', 'products.help': 'Ṣàkóso àwọn ọjà, owó àti ọjà ìbẹ̀rẹ̀.', 'products.add': '+ Fi Ọjà Kún',
    'products.confirmRemove': 'Yọ ọjà yìí kúrò?', 'products.removed': 'A ti yọ ọjà kúrò', 'products.added': 'A ti fi ọjà kún', 'products.updated': 'A ti ṣe ọjà dọ́gba',
    'products.nameRequired': 'Orúkọ ọjà kò gbọdọ̀ ṣófo', 'products.duplicate': 'Ọjà tí orúkọ rẹ̀ jẹ́ “{name}” ti wà',
    'products.priceUpdated': 'A ti ṣe owó dọ́gba. Àwọn ìròyìn àtijọ́ yóò pa owó wọn àkọ́kọ́ mọ́.', 'products.priceSynced': 'A ti ṣe owó dọ́gba lórí ojú-ìwé Ọjà náà pẹ̀lú',
    'products.empty': 'Kò tíì sí ọjà. Fi ọ̀kan kún tàbí gbé àtòjọ wọlé.', 'products.ariaCategory': 'Ẹ̀ka fún {name}',
    'products.newTitle': 'Fi ọjà kún', 'products.name': 'Orúkọ ọjà', 'products.category': 'Ẹ̀ka', 'products.price': 'Owó ẹyọ kan', 'products.opening': 'Ọjà ìbẹ̀rẹ̀',

    'reports.title': 'Ìròyìn', 'reports.help': 'Wo àwọn ọjọ́ tí a fi pamọ́ tàbí ṣe ìròyìn fún àkókò tí o fẹ́.', 'reports.from': 'Láti', 'reports.to': 'Dé',
    'reports.generate': 'Ṣe Ìròyìn', 'reports.exportCsv': 'Gbé CSV Jáde', 'reports.exportAll': 'Gbé Gbogbo CSV Jáde', 'reports.history': 'Ìtàn Ọjà',
    'reports.saved': 'Àwọn Ìròyìn Ojoojúmọ́ Tí A Fi Pamọ́', 'reports.none': 'Kò tíì sí ìròyìn tí a fi pamọ́.', 'reports.totalSales': 'Àpapọ̀ Títà', 'reports.savedDays': 'Àwọn Ọjọ́ Tí A Fi Pamọ́',
    'reports.topProducts': 'Àwọn Ọjà Tó Ń Tà Jù', 'reports.categorySales': 'Títà Ní Ẹ̀ka', 'reports.noData': 'Kò sí dátà.', 'reports.currentPrice': 'Owó Lọ́wọ́lọ́wọ́',
    'reports.totalUnits': 'Àpapọ̀ Iye Tí A Tà', 'reports.priceChanges': 'Àyípadà Owó', 'reports.noPriceChanges': 'Kò tíì sí àyípadà owó tí a kọ sílẹ̀.',
    'reports.via': 'nípasẹ̀ {src}', 'reports.was': 'jẹ́ {price}', 'reports.noActivity': 'Kò tíì sí àkọsílẹ̀ fún ọjà yìí.', 'reports.noProducts': 'Kò sí ọjà.',
    'reports.chooseProduct': 'Yan ọjà', 'reports.rangeTooLong': 'Yan àkókò tí kò ju ọdún 5 lọ.', 'reports.draft': 'Àkọsílẹ̀ àkọ́kọ́',
    'col.action': 'Iṣẹ́', 'src.daily': 'Títà Ojoojúmọ́', 'src.products': 'Ojú-ìwé Ọjà', 'src.import': 'Gbígbé Excel wọlé',

    'an.title': 'Ìtúpalẹ̀ Títà', 'an.help': 'Ìtẹ̀síwájú títà àti bí àwọn ọjà ṣe ń ṣe.', 'an.lastN': 'Ọjọ́ {n} sẹ́yìn', 'an.period': 'Títà Àkókò Yìí',
    'an.avg': 'Àròpín Títà Ojoojúmọ́', 'an.best': 'Ọjọ́ Títà Tó Dára Jù', 'an.trend': 'Ìtẹ̀síwájú Títà Ojoojúmọ́', 'an.top': 'Àwọn Ọjà Tó Ń Tà Jù',
    'an.cat': 'Iṣẹ́ Ẹ̀ka', 'an.qty': '{n} ni a tà', 'an.none': 'Kò sí títà tí a fi pamọ́.',

    'imp.title': 'Gbé Excel Wọlé', 'imp.help': 'Gbé àtòjọ ọjà rẹ wọlé tàbí ṣe é dọ́gba láti Excel/CSV.', 'imp.upload': 'Gbé Àtòjọ Ọjà Sókè', 'imp.button': 'Gbé Fáìlì Wọlé',
    'imp.required': 'Àwọn ọ̀wọ́n tí a nílò', 'imp.optional': 'Àṣàyàn: SKU. Orúkọ ẹ̀ka èyíkéyìí dára (bíi Drinks, Snacks, Bread). Àwọn àkọlé ọ̀wọ́n gbọ́dọ̀ jẹ́ ní èdè Gẹ̀ẹ́sì.',
    'imp.template': 'Gba Àpẹẹrẹ', 'imp.select': 'Kọ́kọ́ yan fáìlì', 'imp.tooBig': 'Fáìlì tóbi jù (tó pọ̀ jù ni 5 MB).', 'imp.noRows': 'Kò rí ìlà ọjà kankan',
    'imp.cols': 'Àwọn ọ̀wọ́n tí a nílò: Category, Product, Unit Price, Opening Stock', 'imp.done': 'A ti gbé ọjà {n} wọlé ní àṣeyọrí.',
    'imp.failed': 'Gbígbé wọlé kùnà: {msg}', 'imp.complete': 'Gbígbé wọlé ti parí', 'imp.tooMany': 'Ìlà pọ̀ jù (tó pọ̀ jù ni 5,000).', 'imp.reader': 'Kò lè gbé olùkàwé Excel wá. Lo CSV tàbí tún ojú-ìwé yìí ṣe.',

    'set.title': 'Ètò', 'set.help': 'Yí orúkọ olùlò àti ọ̀rọ̀ aṣínà rẹ padà, kí o sì yan èdè rẹ.', 'set.username': 'Orúkọ olùlò', 'set.currentPw': 'Ọ̀rọ̀ aṣínà lọ́wọ́lọ́wọ́',
    'set.newPw': 'Ọ̀rọ̀ aṣínà tuntun', 'set.confirmPw': 'Jẹ́rìí ọ̀rọ̀ aṣínà', 'set.save': 'Fi Ètò Ìwọlé Pamọ́', 'set.required': 'Orúkọ olùlò àti ọ̀rọ̀ aṣínà lọ́wọ́lọ́wọ́ ṣe pàtàkì.',
    'set.pwLength': 'Ọ̀rọ̀ aṣínà tuntun gbọ́dọ̀ jẹ́ ọ̀rọ̀ 8–128.', 'set.mismatch': 'Ìjẹ́rìí ọ̀rọ̀ aṣínà kò báramu.', 'set.updating': 'Ń ṣe é dọ́gba…',
    'set.updated': 'A ti ṣe ètò ìwọlé dọ́gba.', 'set.dataTitle': 'Dátà', 'set.dataHelp': 'À ń fi àkọsílẹ̀ pamọ́ lẹ́sẹ̀kẹsẹ̀ sórí ẹ̀rọ yìí, a sì ń fi ránṣẹ́ sórí íńtánẹ́ẹ̀tì. Máa gbé CSV jáde déédéé fún ìpamọ́.',
    'set.reset': 'Pa Gbogbo Dátà Rẹ́', 'set.resetConfirm': 'Pa gbogbo ọjà, ìròyìn àti àkọsílẹ̀ gbèsè rẹ́ lórí gbogbo ẹ̀rọ? A kò lè dá a padà. Kọ́kọ́ gbé CSV jáde tí o bá fẹ́ ìpamọ́.',
    'set.resetDone': 'A ti pa gbogbo dátà rẹ́', 'set.logoutFail': 'Kò lè jẹ́rìí ìfipamọ́ sórí íńtánẹ́ẹ̀tì. Ṣé kí o jáde bẹ́ẹ̀? Àwọn àyípadà tí a kò tíì fi ránṣẹ́ lórí ẹ̀rọ yìí yóò sọnù.',

    'team.title': 'Ẹgbẹ́ àti Ìsanwó', 'team.one': 'Ẹni 1 × {price} = {total} lóṣù', 'team.many': 'Ẹni {n} × {price} = {total} lóṣù',
    'team.trialFree': ' (ọ̀fẹ́ nígbà àdánwò rẹ)', 'team.staffLogin': 'Orúkọ ìwọlé òṣìṣẹ́', 'team.staffPw': 'Ọ̀rọ̀ aṣínà òṣìṣẹ́', 'team.add': 'Fi olùlò kún ({price} / oṣù)',
    'team.none': 'Kò tíì sí òṣìṣẹ́ — ìwọ nìkan ni olùlò.', 'team.added': 'A ti fi olùlò kún.', 'team.confirmRemove': 'Yọ olùlò yìí kúrò? Kò ní lè wọlé mọ́.',

    'co.title': 'Àwọn Ilé-iṣẹ́', 'co.help': 'Gbogbo iṣẹ́ òwò tó forúkọ sílẹ̀ lórí StockLedger.', 'co.refresh': 'Sọ Dọ̀tun', 'co.business': 'Iṣẹ́ òwò', 'co.owner': 'Ìwọlé olónìí',
    'co.plan': 'Ètò', 'co.staff': 'Òṣìṣẹ́', 'co.joined': 'Ọjọ́ tó darapọ̀', 'co.loading': 'Ń gbé àwọn ilé-iṣẹ́ wá…', 'co.one': 'A rí ilé-iṣẹ́ 1.', 'co.many': 'A rí ilé-iṣẹ́ {n}.',
    'co.none': 'Kò rí ilé-iṣẹ́ kankan.', 'plan.trial': 'Àdánwò', 'plan.active': 'Ìforúkọsílẹ̀ tó ń ṣiṣẹ́', 'plan.suspended': 'A ti dá dúró',

    'cr.title': 'Títà Lórí Gbèsè àti Àwọn Onígbèsè', 'cr.totalCredit': 'Àpapọ̀ Títà Lórí Gbèsè', 'cr.totalPaid': 'Àpapọ̀ Ìsanwó', 'cr.outstanding': 'Gbèsè Tó Kù', 'cr.customers': 'Àwọn Oníbàárà',
    'cr.tabDebtors': 'Àwọn Onígbèsè', 'cr.tabSale': 'Títà Lórí Gbèsè Tuntun', 'cr.tabPay': 'Kọ Ìsanwó Sílẹ̀', 'cr.register': 'Ìwé Orúkọ Àwọn Onígbèsè', 'cr.name': 'Orúkọ oníbàárà',
    'cr.phone': 'Fóònù', 'cr.address': 'Àdírẹ́sì', 'cr.limit': 'Ààlà gbèsè', 'cr.openingBal': 'Gbèsè ìbẹ̀rẹ̀ (gbèsè tó wà tẹ́lẹ̀)', 'cr.notes': 'Àkíyèsí',
    'cr.addDebtor': 'Fi Onígbèsè Kún', 'cr.customer': 'Oníbàárà', 'cr.creditSales': 'Títà Lórí Gbèsè', 'cr.payments': 'Ìsanwó', 'cr.balance': 'Tó kù', 'cr.ledger': 'Ìwé Àkọsílẹ̀',
    'cr.noDebtors': 'Kò tíì sí oníbàárà.', 'cr.selectCustomer': 'Yan oníbàárà', 'cr.selectProduct': 'Yan ọjà', 'cr.qty': 'Iye', 'cr.unitPrice': 'Owó ẹyọ kan',
    'cr.amountPaid': 'Owó tí a san báyìí', 'cr.dueDate': 'Ọjọ́ ìsanwó', 'cr.saveSale': 'Fi Títà Lórí Gbèsè Pamọ́', 'cr.amount': 'Owó', 'cr.date': 'Ọjọ́', 'cr.method': 'Ọ̀nà',
    'cr.reference': 'Ìtọ́kasí', 'cr.savePay': 'Fi Ìsanwó Pamọ́', 'cr.cash': 'Owó ọwọ́', 'cr.transfer': 'Ìfiránṣẹ́ owó', 'cr.pos': 'POS', 'cr.other': 'Òmíràn',
    'cr.nameReq': 'Orúkọ oníbàárà ṣe pàtàkì.', 'cr.saleInvalid': 'Yan oníbàárà, ọjà àti iye tó tọ́.', 'cr.overSale': 'Ìsanwó kò gbọdọ̀ ju owó títà lọ.',
    'cr.saleDone': 'A ti kọ títà lórí gbèsè sílẹ̀. Tó kù: {amount}', 'cr.overLimit': 'Títà yìí yóò mú {name} jẹ {balance}, tó ju ààlà gbèsè {limit} lọ. Ṣé kí a tẹ̀síwájú?',
    'cr.payInvalid': 'Yan oníbàárà kí o sì fi owó tó tọ́ sí.', 'cr.overBalance': 'Ìsanwó yìí ju {balance} tó jẹ lọ. Ṣé kí a kọ ọ́ sílẹ̀ bẹ́ẹ̀?',
    'cr.payDone': 'A ti kọ ìsanwó sílẹ̀', 'cr.debtorAdded': 'A ti fi oníbàárà kún', 'cr.back': '← Padà', 'cr.ledgerTitle': '{name} — Ìwé Àkọsílẹ̀ Oníbàárà',
    'cr.phoneAddr': 'Fóònù: {phone} · Àdírẹ́sì: {address}', 'cr.balanceLine': 'Gbèsè Tó Kù: {amount}', 'cr.type': 'Irú', 'cr.debit': 'Gbèsè Tí A Fi Kún', 'cr.creditCol': 'Ìsanwó',
    'cr.typeSale': 'Títà Lórí Gbèsè', 'cr.typePay': 'Ìsanwó', 'cr.typeOpen': 'Gbèsè ìbẹ̀rẹ̀', 'cr.atSale': 'Nígbà títà', 'cr.paymentAtSale': 'Ìsanwó lórí títà lórí gbèsè',

    'err.AUTH_REQUIRED': 'Àkókò rẹ ti parí. Jọ̀wọ́ wọlé lẹ́ẹ̀kan sí i.', 'err.LOGIN_INVALID': 'Orúkọ olùlò tàbí ọ̀rọ̀ aṣínà kò tọ́.',
    'err.RATE_LIMITED': 'O gbìyànjú ju báyẹn lọ. Jọ̀wọ́ dúró díẹ̀ kí o tún gbìyànjú.', 'err.BUSINESS_NAME': 'Fi orúkọ iṣẹ́ òwò rẹ sí (ọ̀rọ̀ 2–80).',
    'err.USERNAME_INVALID': 'Orúkọ ìwọlé gbọ́dọ̀ jẹ́ ọ̀rọ̀ 3–100 láìsí àlàfo.', 'err.PASSWORD_INVALID': 'Ọ̀rọ̀ aṣínà gbọ́dọ̀ jẹ́ ọ̀rọ̀ 8–128.',
    'err.USERNAME_TAKEN': 'Ẹlòmíràn ti lo orúkọ ìwọlé yẹn.', 'err.FORBIDDEN': 'O kò ní àṣẹ láti ṣe bẹ́ẹ̀.',
    'err.SUBSCRIPTION_ENDED': 'Àdánwò tàbí ìforúkọsílẹ̀ rẹ ti parí. Sọ ọ́ di tuntun láti máa fi àyípadà pamọ́.', 'err.PAYLOAD_TOO_LARGE': 'Dátà pọ̀ jù. Gbé àwọn ìròyìn àtijọ́ jáde kí o tún gbìyànjú.',
    'err.CONFLICT': 'Ẹ̀rọ mìíràn fi pamọ́ ní àkókò kan náà. Jọ̀wọ́ tún gbìyànjú.', 'err.RESET': 'A ti pa dátà rẹ́ lórí ẹ̀rọ mìíràn. Ń tún gbé wá…',
    'err.BAD_REQUEST': 'Ìbéèrè yẹn kò tọ́.', 'err.STAFF_LIMIT': 'Ààlà òṣìṣẹ́ ti pé.', 'err.SERVER_ERROR': 'Ìṣòro wà ní ẹ̀gbẹ́ wa. Jọ̀wọ́ tún gbìyànjú.',
    'err.NETWORK': 'Kò lè dé ẹ̀rọ olùpèsè. Ṣàyẹ̀wò ìsopọ̀ rẹ.'
  };

  const ha = {
    'app.title': 'StockLedger — Tallace-tallace da Kaya', 'app.subtitle': 'Kula da Tallace-tallace da Kaya', 'app.brand': 'Kasuwancina',
    'lang.label': 'Harshe', 'skip': 'Tsallaka zuwa abun ciki',
    'common.logout': 'Fita', 'common.cancel': 'Soke', 'common.save': 'Ajiye', 'common.remove': 'Cire', 'common.edit': 'Gyara', 'common.wait': 'Don Allah a jira…',
    'nav.aria': 'Babba', 'nav.sales': 'Tallace-tallacen Yau da Kullum', 'nav.products': 'Kayayyaki', 'nav.reports': 'Rahotanni', 'nav.analytics': 'Nazari',
    'nav.credit': 'Bashi da Masu Bashi', 'nav.import': 'Shigo da Excel', 'nav.settings': 'Saituna', 'nav.companies': 'Kamfanoni',

    'login.eyebrow': 'StockLedger don kasuwancin da ke girma', 'login.headline': 'Ka san abin da aka sayar. Ka san abin da ya rage.',
    'login.lead': 'Bibiyi tallace-tallace na yau da kullum, kaya, bashi da masu bashi a wuri guda mai sauƙi.',
    'login.p1': 'Kula da kaya kullum', 'login.p2': 'Sauƙin shiga ga ma’aikata', 'login.p3': 'Farashi a bayyane',
    'login.tagline': 'Bibiyar tallace-tallace, kaya da bashin kasuwancinka', 'login.startFree': 'Fara kyauta',
    'login.pricing': 'Kwana 14 kyauta, sannan ₦{price} ga kowane mutum a wata.', 'login.tabIn': 'Shiga', 'login.tabUp': 'Fara gwaji kyauta',
    'login.business': 'Sunan kasuwanci', 'login.user': 'Imel ko sunan mai amfani', 'login.password': 'Kalmar sirri', 'login.passwordHint': 'Aƙalla haruffa 8',
    'login.submitIn': 'Shiga', 'login.submitUp': 'Buɗe asusu', 'login.hint': 'Gwajin kwana 14 kyauta, sannan ₦{price} ga kowane mutum a wata. Ba a buƙatar kati.',

    'status.saved': 'An ajiye duk canje-canje', 'status.saving': 'Ana ajiyewa…', 'status.storageFull': 'Ba a ajiye ba — wurin ajiya ya cika',
    'status.cloudSaved': 'An ajiye a intanet', 'status.cloudFailed': 'Ajiyewa a intanet ya gaza — a sake gwadawa', 'status.cloudLoaded': 'An sauko da bayanai daga intanet',
    'status.cloudOffline': 'Babu intanet — an ajiye canje-canjenka a wayarka', 'status.readOnly': 'Karantawa kawai — rajista ya ƙare',
    'toast.storageFull': 'Ba a iya ajiyewa ba. Share wuri a ma’adanar wayarka.',
    'acct.superadmin': 'Babban mai gudanarwa', 'acct.trialLeft': 'Gwaji: saura kwana {n}', 'acct.ended': 'Rajista ya ƙare (karantawa kawai)',
    'acct.banner': 'Gwajinka ko rajistarka ya ƙare. Kana iya dubawa da fitar da bayananka, amma ba za a iya ajiye canje-canje ba sai ka sabunta.',
    'acct.readOnlyToast': 'Karantawa kawai: sabunta rajistarka domin yin canje-canje.',

    'sales.title': 'Tallace-tallacen Yau da Kullum', 'sales.help': 'Farko + ƙari − rufewa = adadin da aka sayar.', 'sales.toolbar': 'Ayyukan rana',
    'sales.date': 'Ranar kasuwanci', 'sales.changeDate': 'Canja Rana', 'sales.clone': 'Kwafi Rahoto', 'sales.clear': 'Share Bayanai',
    'sales.editDay': 'Gyara Rana', 'sales.saveDay': 'Ajiye Rana', 'sales.updateDay': 'Sabunta Rana',
    'sales.locked': 'An ajiye wannan rana kuma an kulle ta. Danna “Gyara Rana” don gyara shigarwa ko ƙara tallace-tallacen da aka manta.',
    'sales.tableTitle': 'Kaya da Tallace-tallace', 'sales.search': 'Nemi kaya…', 'sales.searchAria': 'Nemi kayayyaki',
    'sales.empty': 'Ba a sami kaya ba.', 'sales.qty': 'Adadi', 'sales.add': 'Ƙara', 'sales.unitsSold': 'an sayar da {n}',
    'sales.ariaSold': 'Adadin da aka sayar na {name}', 'sales.ariaAdd': 'Ƙara adadin da aka sayar na {name}',
    'm.sales': 'Tallace-tallace', 'm.units': 'Adadin da Aka Sayar', 'm.added': 'Kayan da Aka Ƙara', 'm.closing': 'Kayan da Suka Rage',
    'col.category': 'Rukuni', 'col.product': 'Kaya', 'col.opening': 'Farko', 'col.additions': 'Ƙari', 'col.available': 'Akwai',
    'col.closing': 'Rufewa', 'col.sold': 'An sayar', 'col.addSale': 'Ƙara Siyarwa', 'col.unitPrice': 'Farashin Ɗaya', 'col.sales': 'Tallace-tallace',
    'col.sku': 'SKU', 'col.openingStock': 'Kayan Farko', 'col.actions': 'Ayyuka', 'col.date': 'Rana',
    'sales.onlyLeft': '{n} {name} kawai suka rage', 'sales.addedSold': 'An ƙara {n} da aka sayar: {name}', 'sales.clickEdit': 'Danna Gyara Rana don ƙara tallace-tallace',
    'sales.editing': 'Ana gyara {date} — ana ajiye canje-canje kai tsaye', 'sales.pickDifferent': 'Zaɓi wata rana daban don kwafawa',
    'sales.nothing': 'Babu abin da aka rubuta a {date}', 'sales.nothingClear': 'Babu abin da za a share a {date}',
    'sales.replaceClone': 'Akwai rahoto na {to} tuni. A maye gurbinsa da kwafin {from}?', 'sales.replaceMove': 'Akwai rahoto na {to} tuni. A maye gurbinsa?',
    'sales.cloned': 'An kwafi rahoto zuwa {date}', 'sales.moved': 'An mayar da rahoto zuwa {date}',
    'sales.clearConfirm': 'A share duk bayanan {date}? Wannan zai share shigarwar wannan rana da rahoton da aka ajiye domin ka fara sabo.', 'sales.cleared': 'An share bayanan {date}',
    'sales.saved': 'An ajiye rahoton yau da kullum', 'sales.updated': 'An sabunta rahoton yau da kullum',
    'dlg.moveTitle': 'Canja ranar kasuwanci', 'dlg.cloneTitle': 'Kwafi rahoto', 'dlg.current': 'Ranar yanzu: {date}',
    'dlg.cloneHelp': 'Kwafi duk shigarwa daga {date} zuwa sabuwar rana. Na asali ba zai canja ba.', 'dlg.newDate': 'Sabuwar rana',
    'dlg.move': 'Mayar da Rahoto', 'dlg.clone': 'Kwafi Rahoto',

    'products.title': 'Kayayyaki', 'products.help': 'Sarrafa kayayyaki, farashi da kayan farko.', 'products.add': '+ Ƙara Kaya',
    'products.confirmRemove': 'A cire wannan kaya?', 'products.removed': 'An cire kaya', 'products.added': 'An ƙara kaya', 'products.updated': 'An sabunta kaya',
    'products.nameRequired': 'Sunan kaya ba zai iya zama babu komai ba', 'products.duplicate': 'Akwai kaya mai suna “{name}” tuni',
    'products.priceUpdated': 'An sabunta farashi. Rahotannin baya za su riƙe farashinsu na asali.', 'products.priceSynced': 'An sabunta farashi a shafin Kayayyaki ma',
    'products.empty': 'Babu kaya tukuna. Ƙara ɗaya ko shigo da jerin kaya.', 'products.ariaCategory': 'Rukunin {name}',
    'products.newTitle': 'Ƙara kaya', 'products.name': 'Sunan kaya', 'products.category': 'Rukuni', 'products.price': 'Farashin ɗaya', 'products.opening': 'Kayan farko',

    'reports.title': 'Rahotanni', 'reports.help': 'Duba kwanakin da aka ajiye ko ƙirƙiri rahoton wani lokaci.', 'reports.from': 'Daga', 'reports.to': 'Zuwa',
    'reports.generate': 'Ƙirƙiri Rahoto', 'reports.exportCsv': 'Fitar da CSV', 'reports.exportAll': 'Fitar da Duka CSV', 'reports.history': 'Tarihin Kaya',
    'reports.saved': 'Rahotannin Yau da Kullum da Aka Ajiye', 'reports.none': 'Babu rahoton da aka ajiye tukuna.', 'reports.totalSales': 'Jimillar Tallace-tallace', 'reports.savedDays': 'Kwanakin da Aka Ajiye',
    'reports.topProducts': 'Kayan da Suka Fi Sayuwa', 'reports.categorySales': 'Tallace-tallace Bisa Rukuni', 'reports.noData': 'Babu bayanai.', 'reports.currentPrice': 'Farashin Yanzu',
    'reports.totalUnits': 'Jimillar Adadin da Aka Sayar', 'reports.priceChanges': 'Canjin Farashi', 'reports.noPriceChanges': 'Ba a rubuta wani canjin farashi ba tukuna.',
    'reports.via': 'ta {src}', 'reports.was': 'ya kasance {price}', 'reports.noActivity': 'Babu abin da aka rubuta game da wannan kaya tukuna.', 'reports.noProducts': 'Babu kaya.',
    'reports.chooseProduct': 'Zaɓi kaya', 'reports.rangeTooLong': 'Zaɓi lokaci da bai wuce shekaru 5 ba.', 'reports.draft': 'Daftari',
    'col.action': 'Aiki', 'src.daily': 'Tallace-tallacen Yau da Kullum', 'src.products': 'Shafin Kayayyaki', 'src.import': 'Shigo da Excel',

    'an.title': 'Nazarin Tallace-tallace', 'an.help': 'Yanayin tallace-tallace da yadda kayayyaki ke tafiya.', 'an.lastN': 'Kwanaki {n} da suka wuce', 'an.period': 'Tallace-tallacen Wannan Lokaci',
    'an.avg': 'Matsakaicin Tallace-tallace na Kullum', 'an.best': 'Ranar da Aka Fi Sayarwa', 'an.trend': 'Yanayin Tallace-tallace na Kullum', 'an.top': 'Kayan da Suka Fi Sayuwa',
    'an.cat': 'Aikin Rukuni', 'an.qty': 'an sayar da {n}', 'an.none': 'Babu tallace-tallacen da aka ajiye.',

    'imp.title': 'Shigo da Excel', 'imp.help': 'Shigo da ko sabunta jerin kayanka daga Excel/CSV.', 'imp.upload': 'Ɗora Jerin Kaya', 'imp.button': 'Shigo da Fayil',
    'imp.required': 'Ginshiƙan da ake buƙata', 'imp.optional': 'Na zaɓi: SKU. Kowane sunan rukuni zai yi (misali Drinks, Snacks, Bread). Dole ne taken ginshiƙai ya zama da Turanci.',
    'imp.template': 'Sauko da Samfuri', 'imp.select': 'Da farko zaɓi fayil', 'imp.tooBig': 'Fayil ɗin ya yi girma da yawa (mafi girma 5 MB).', 'imp.noRows': 'Ba a sami layukan kaya ba',
    'imp.cols': 'Ginshiƙan da ake buƙata: Category, Product, Unit Price, Opening Stock', 'imp.done': 'An shigo da kaya {n} cikin nasara.',
    'imp.failed': 'Shigowa ta gaza: {msg}', 'imp.complete': 'An kammala shigowa', 'imp.tooMany': 'Layuka sun yi yawa (mafi yawa 5,000).', 'imp.reader': 'Ba a iya loda mai karanta Excel ba. Yi amfani da CSV ko sabunta shafin.',

    'set.title': 'Saituna', 'set.help': 'Canja sunan mai amfani da kalmar sirrinka, kuma zaɓi harshenka.', 'set.username': 'Sunan mai amfani', 'set.currentPw': 'Kalmar sirri ta yanzu',
    'set.newPw': 'Sabuwar kalmar sirri', 'set.confirmPw': 'Tabbatar da kalmar sirri', 'set.save': 'Ajiye Saitunan Shiga', 'set.required': 'Ana buƙatar sunan mai amfani da kalmar sirri ta yanzu.',
    'set.pwLength': 'Sabuwar kalmar sirri dole ta kasance haruffa 8–128.', 'set.mismatch': 'Tabbatar da kalmar sirri bai yi daidai ba.', 'set.updating': 'Ana sabuntawa…',
    'set.updated': 'An sabunta saitunan shiga.', 'set.dataTitle': 'Bayanai', 'set.dataHelp': 'Ana ajiye shigarwa nan take a wannan na’ura kuma a aika zuwa intanet. Fitar da CSV akai-akai a matsayin madadin.',
    'set.reset': 'Share Duk Bayanan Manhaja', 'set.resetConfirm': 'A share duk kayayyaki, rahotanni da bayanan bashi a duk na’urori? Ba za a iya dawo da su ba. Da farko fitar da CSV idan kana son madadin.',
    'set.resetDone': 'An share duk bayanai', 'set.logoutFail': 'Ba a iya tabbatar da ajiyewa a intanet ba. A fita ko da haka? Canje-canjen da ba a aika ba a wannan na’ura za su ɓace.',

    'team.title': 'Ƙungiya da Biyan Kuɗi', 'team.one': 'Mutum 1 × {price} = {total} a wata', 'team.many': 'Mutane {n} × {price} = {total} a wata',
    'team.trialFree': ' (kyauta lokacin gwajinka)', 'team.staffLogin': 'Sunan shigar ma’aikaci', 'team.staffPw': 'Kalmar sirrin ma’aikaci', 'team.add': 'Ƙara mai amfani ({price} / wata)',
    'team.none': 'Babu ma’aikaci tukuna — kai kaɗai ne mai amfani.', 'team.added': 'An ƙara mai amfani.', 'team.confirmRemove': 'A cire wannan mai amfani? Ba zai ƙara iya shiga ba.',

    'co.title': 'Kamfanoni', 'co.help': 'Kowane kasuwancin da aka yi wa rajista a StockLedger.', 'co.refresh': 'Wartsake', 'co.business': 'Kasuwanci', 'co.owner': 'Sunan shigar mai shi',
    'co.plan': 'Tsari', 'co.staff': 'Ma’aikata', 'co.joined': 'Ranar shiga', 'co.loading': 'Ana loda kamfanoni…', 'co.one': 'An sami kamfani 1.', 'co.many': 'An sami kamfanoni {n}.',
    'co.none': 'Ba a sami kamfani ba.', 'plan.trial': 'Gwaji', 'plan.active': 'Rajista mai aiki', 'plan.suspended': 'An dakatar',

    'cr.title': 'Sayarwa da Bashi da Masu Bashi', 'cr.totalCredit': 'Jimillar Sayarwa da Bashi', 'cr.totalPaid': 'Jimillar Biyan Kuɗi', 'cr.outstanding': 'Sauran Bashi', 'cr.customers': 'Abokan Ciniki',
    'cr.tabDebtors': 'Masu Bashi', 'cr.tabSale': 'Sabuwar Sayarwa da Bashi', 'cr.tabPay': 'Rubuta Biyan Kuɗi', 'cr.register': 'Rajistar Masu Bashi', 'cr.name': 'Sunan abokin ciniki',
    'cr.phone': 'Waya', 'cr.address': 'Adireshi', 'cr.limit': 'Iyakar bashi', 'cr.openingBal': 'Bashin farko (bashin da ake bi)', 'cr.notes': 'Bayanin kula',
    'cr.addDebtor': 'Ƙara Mai Bashi', 'cr.customer': 'Abokin ciniki', 'cr.creditSales': 'Sayarwa da Bashi', 'cr.payments': 'Biyan Kuɗi', 'cr.balance': 'Saura', 'cr.ledger': 'Littafin Lissafi',
    'cr.noDebtors': 'Babu abokin ciniki tukuna.', 'cr.selectCustomer': 'Zaɓi abokin ciniki', 'cr.selectProduct': 'Zaɓi kaya', 'cr.qty': 'Adadi', 'cr.unitPrice': 'Farashin ɗaya',
    'cr.amountPaid': 'Kuɗin da aka biya yanzu', 'cr.dueDate': 'Ranar biya', 'cr.saveSale': 'Ajiye Sayarwa da Bashi', 'cr.amount': 'Kuɗi', 'cr.date': 'Rana', 'cr.method': 'Hanya',
    'cr.reference': 'Lamba/Bayani', 'cr.savePay': 'Ajiye Biyan Kuɗi', 'cr.cash': 'Kuɗi hannu', 'cr.transfer': 'Canja wuri', 'cr.pos': 'POS', 'cr.other': 'Wani',
    'cr.nameReq': 'Ana buƙatar sunan abokin ciniki.', 'cr.saleInvalid': 'Zaɓi abokin ciniki, kaya da adadi mai kyau.', 'cr.overSale': 'Biyan kuɗi ba zai wuce kuɗin sayarwar ba.',
    'cr.saleDone': 'An rubuta sayarwa da bashi. Saura: {amount}', 'cr.overLimit': 'Wannan sayarwa za ta sa {name} ya zama yana bin {balance}, wanda ya wuce iyakar bashi ta {limit}. A ci gaba?',
    'cr.payInvalid': 'Zaɓi abokin ciniki ka shigar da kuɗi mai kyau.', 'cr.overBalance': 'Wannan biyan ya fi {balance} da ake bi. A rubuta shi ko da haka?',
    'cr.payDone': 'An rubuta biyan kuɗi', 'cr.debtorAdded': 'An ƙara abokin ciniki', 'cr.back': '← Koma', 'cr.ledgerTitle': '{name} — Littafin Lissafin Abokin Ciniki',
    'cr.phoneAddr': 'Waya: {phone} · Adireshi: {address}', 'cr.balanceLine': 'Sauran Bashi: {amount}', 'cr.type': 'Nau’i', 'cr.debit': 'Bashi da Aka Ƙara', 'cr.creditCol': 'Biyan Kuɗi',
    'cr.typeSale': 'Sayarwa da Bashi', 'cr.typePay': 'Biyan Kuɗi', 'cr.typeOpen': 'Bashin farko', 'cr.atSale': 'A lokacin sayarwa', 'cr.paymentAtSale': 'Biyan kuɗi kan sayarwa da bashi',

    'err.AUTH_REQUIRED': 'Lokacinka ya ƙare. Don Allah a sake shiga.', 'err.LOGIN_INVALID': 'Sunan mai amfani ko kalmar sirri ba daidai ba ne.',
    'err.RATE_LIMITED': 'An yi ƙoƙari sau da yawa. Don Allah a jira kaɗan a sake gwadawa.', 'err.BUSINESS_NAME': 'Shigar da sunan kasuwancinka (haruffa 2–80).',
    'err.USERNAME_INVALID': 'Sunan shiga dole ya zama haruffa 3–100 ba tare da sarari ba.', 'err.PASSWORD_INVALID': 'Kalmar sirri dole ta zama haruffa 8–128.',
    'err.USERNAME_TAKEN': 'Wani ya riga ya yi amfani da wannan sunan shiga.', 'err.FORBIDDEN': 'Ba ka da izinin yin haka.',
    'err.SUBSCRIPTION_ENDED': 'Gwajinka ko rajistarka ya ƙare. Sabunta don ci gaba da ajiye canje-canje.', 'err.PAYLOAD_TOO_LARGE': 'Bayanai sun yi yawa. Fitar da tsofaffin rahotanni ka sake gwadawa.',
    'err.CONFLICT': 'Wata na’ura ta ajiye a lokaci guda. Don Allah a sake gwadawa.', 'err.RESET': 'An share bayanai a wata na’ura. Ana sake lodawa…',
    'err.BAD_REQUEST': 'Wannan buƙatar ba ta da inganci.', 'err.STAFF_LIMIT': 'An kai iyakar ma’aikata.', 'err.SERVER_ERROR': 'Wata matsala ta faru daga gare mu. Don Allah a sake gwadawa.',
    'err.NETWORK': 'Ba a iya haɗawa da sabar ba. Duba haɗin intanetinka.'
  };

  const pcm = {
    'app.title': 'StockLedger — Sales & Stock', 'app.subtitle': 'How to Control Your Sales & Stock', 'app.brand': 'My Business',
    'lang.label': 'Language', 'skip': 'Skip go main page',
    'common.logout': 'Log out', 'common.cancel': 'Cancel', 'common.save': 'Save', 'common.remove': 'Remove', 'common.edit': 'Edit', 'common.wait': 'Abeg wait small…',
    'nav.aria': 'Main', 'nav.sales': 'Daily Sales', 'nav.products': 'Products', 'nav.reports': 'Reports', 'nav.analytics': 'How Business Dey Go',
    'nav.credit': 'Credit & People Wey Dey Owe', 'nav.import': 'Bring Excel In', 'nav.settings': 'Settings', 'nav.companies': 'Companies',

    'login.eyebrow': 'StockLedger for business wey dey grow', 'login.headline': 'Know wetin sell. Know wetin remain.',
    'login.lead': 'Track daily sales, your stock, credit and people wey dey owe you for one easy place.',
    'login.p1': 'Control your stock everyday', 'login.p2': 'Easy way for your workers to enter', 'login.p3': 'Price clear well well',
    'login.tagline': 'Track your sales, stock and credit for your business', 'login.startFree': 'Start for free',
    'login.pricing': '14 days free, after that ₦{price} for each person every month.', 'login.tabIn': 'Sign in', 'login.tabUp': 'Start free trial',
    'login.business': 'Business name', 'login.user': 'Email or username', 'login.password': 'Password', 'login.passwordHint': 'At least 8 characters',
    'login.submitIn': 'Sign in', 'login.submitUp': 'Open account', 'login.hint': '14 days free trial, after that ₦{price} for each person every month. You no need card.',

    'status.saved': 'Everything don save', 'status.saving': 'Dey save…', 'status.storageFull': 'E no save — space don full',
    'status.cloudSaved': 'E don save for internet', 'status.cloudFailed': 'E no save for internet — try again', 'status.cloudLoaded': 'Data don come from internet',
    'status.cloudOffline': 'No network — we keep your changes for your phone', 'status.readOnly': 'Na only to read — your subscription don finish',
    'toast.storageFull': 'E no save. Free some space for your phone.',
    'acct.superadmin': 'Main Admin', 'acct.trialLeft': 'Trial: {n} days remain', 'acct.ended': 'Subscription don finish (na only to read)',
    'acct.banner': 'Your trial or subscription don finish. You fit see and download your data, but we no go fit save new changes until you renew.',
    'acct.readOnlyToast': 'Na only to read: renew your subscription before you fit change anything.',

    'sales.title': 'Daily Sales', 'sales.help': 'Opening + wetin you add − wetin remain = wetin sell.', 'sales.toolbar': 'Wetin you fit do for the day',
    'sales.date': 'Business date', 'sales.changeDate': 'Change Date', 'sales.clone': 'Copy Report', 'sales.clear': 'Clear Data',
    'sales.editDay': 'Edit Day', 'sales.saveDay': 'Save Day', 'sales.updateDay': 'Update Day',
    'sales.locked': 'This day don save and lock. Click “Edit Day” if you wan correct wetin you write or add sales wey you forget.',
    'sales.tableTitle': 'Stock & Sales', 'sales.search': 'Search product…', 'sales.searchAria': 'Search products',
    'sales.empty': 'We no see any product.', 'sales.qty': 'How many', 'sales.add': 'Add', 'sales.unitsSold': '{n} don sell',
    'sales.ariaSold': 'How many sell for {name}', 'sales.ariaAdd': 'Add how many sell for {name}',
    'm.sales': 'Sales', 'm.units': 'Units Wey Sell', 'm.added': 'Stock Wey You Add', 'm.closing': 'Stock Wey Remain',
    'col.category': 'Category', 'col.product': 'Product', 'col.opening': 'Opening', 'col.additions': 'Wetin You Add', 'col.available': 'Wetin Dey',
    'col.closing': 'Wetin Remain', 'col.sold': 'Sold', 'col.addSale': 'Add Sale', 'col.unitPrice': 'Price for One', 'col.sales': 'Sales',
    'col.sku': 'SKU', 'col.openingStock': 'Opening Stock', 'col.actions': 'Actions', 'col.date': 'Date',
    'sales.onlyLeft': 'Only {n} {name} remain', 'sales.addedSold': 'We add {n} wey sell: {name}', 'sales.clickEdit': 'Click Edit Day make you fit add sales',
    'sales.editing': 'You dey edit {date} — changes dey save by themselves', 'sales.pickDifferent': 'Choose another date to copy go',
    'sales.nothing': 'Nothing dey for {date} yet', 'sales.nothingClear': 'Nothing to clear for {date}',
    'sales.replaceClone': 'Report don dey for {to}. You wan replace am with copy of {from}?', 'sales.replaceMove': 'Report don dey for {to}. You wan replace am?',
    'sales.cloned': 'We don copy report go {date}', 'sales.moved': 'We don move report go {date}',
    'sales.clearConfirm': 'Clear all data for {date}? E go delete wetin you write for this day and the report wey you save so you fit start fresh.', 'sales.cleared': 'We don clear data for {date}',
    'sales.saved': 'Daily report don save', 'sales.updated': 'Daily report don update',
    'dlg.moveTitle': 'Change business date', 'dlg.cloneTitle': 'Copy report', 'dlg.current': 'Date now: {date}',
    'dlg.cloneHelp': 'Copy everything from {date} go new date. The first one no go change.', 'dlg.newDate': 'New date',
    'dlg.move': 'Move Report', 'dlg.clone': 'Copy Report',

    'products.title': 'Products', 'products.help': 'Manage your products, prices and opening stock.', 'products.add': '+ Add Product',
    'products.confirmRemove': 'You wan remove this product?', 'products.removed': 'Product don comot', 'products.added': 'Product don add', 'products.updated': 'Product don update',
    'products.nameRequired': 'Product name no fit empty', 'products.duplicate': 'Product wey dem call “{name}” don already dey',
    'products.priceUpdated': 'Price don update. Old reports go keep their old price.', 'products.priceSynced': 'We update the price for Products page too',
    'products.empty': 'No product dey yet. Add one or bring list in.', 'products.ariaCategory': 'Category for {name}',
    'products.newTitle': 'Add product', 'products.name': 'Product name', 'products.category': 'Category', 'products.price': 'Price for one', 'products.opening': 'Opening stock',

    'reports.title': 'Reports', 'reports.help': 'Look the days wey you save or make report for any period.', 'reports.from': 'From', 'reports.to': 'To',
    'reports.generate': 'Make Report', 'reports.exportCsv': 'Download CSV', 'reports.exportAll': 'Download All CSV', 'reports.history': 'Product History',
    'reports.saved': 'Daily Reports Wey You Save', 'reports.none': 'No saved report yet.', 'reports.totalSales': 'Total Sales', 'reports.savedDays': 'Days Wey You Save',
    'reports.topProducts': 'Products Wey Sell Pass', 'reports.categorySales': 'Sales by Category', 'reports.noData': 'No data.', 'reports.currentPrice': 'Price Now',
    'reports.totalUnits': 'Total Units Wey Sell', 'reports.priceChanges': 'Price Changes', 'reports.noPriceChanges': 'We never write any price change.',
    'reports.via': 'from {src}', 'reports.was': 'before na {price}', 'reports.noActivity': 'Nothing dey for this product yet.', 'reports.noProducts': 'No product.',
    'reports.chooseProduct': 'Choose product', 'reports.rangeTooLong': 'Choose period wey no pass 5 years.', 'reports.draft': 'Draft',
    'col.action': 'Action', 'src.daily': 'Daily Sales', 'src.products': 'Products page', 'src.import': 'Excel import',

    'an.title': 'Sales Analytics', 'an.help': 'How sales dey go and how each product dey perform.', 'an.lastN': 'Last {n} days', 'an.period': 'Sales for This Period',
    'an.avg': 'Average Daily Sales', 'an.best': 'Best Sales Day', 'an.trend': 'Daily Sales Chart', 'an.top': 'Products Wey Sell Pass',
    'an.cat': 'How Each Category Dey Perform', 'an.qty': '{n} don sell', 'an.none': 'No saved sales.',

    'imp.title': 'Bring Excel In', 'imp.help': 'Bring in or update your stock list from Excel/CSV.', 'imp.upload': 'Upload Stock List', 'imp.button': 'Bring File In',
    'imp.required': 'Columns wey you must get', 'imp.optional': 'If you like: SKU. Any category name correct (like Drinks, Snacks, Bread). The column names must dey for English.',
    'imp.template': 'Download Template', 'imp.select': 'Choose file first', 'imp.tooBig': 'The file too big (5 MB na the maximum).', 'imp.noRows': 'We no see any product row',
    'imp.cols': 'Columns wey you must get: Category, Product, Unit Price, Opening Stock', 'imp.done': 'We don bring in {n} product(s) well.',
    'imp.failed': 'E no work: {msg}', 'imp.complete': 'Import don finish', 'imp.tooMany': 'Rows too many (5,000 na the maximum).', 'imp.reader': 'We no fit load the Excel reader. Use CSV or refresh the page.',

    'set.title': 'Settings', 'set.help': 'Change your login and password, and choose your language.', 'set.username': 'Username', 'set.currentPw': 'Password wey you dey use now',
    'set.newPw': 'New password', 'set.confirmPw': 'Confirm password', 'set.save': 'Save Login Settings', 'set.required': 'Username and your password now dey needed.',
    'set.pwLength': 'New password must be 8–128 characters.', 'set.mismatch': 'The two passwords no match.', 'set.updating': 'Dey update…',
    'set.updated': 'Login settings don update.', 'set.dataTitle': 'Data', 'set.dataHelp': 'Everything wey you write dey save sharp-sharp for this phone and e go enter the internet. Download CSV often as backup.',
    'set.reset': 'Clear All App Data', 'set.resetConfirm': 'Clear all products, reports and credit records for every device? You no fit bring am back. Download CSV first if you want backup.',
    'set.resetDone': 'All data don clear', 'set.logoutFail': 'We no fit confirm say internet save work. You still wan log out? Changes wey never go internet for this phone go loss.',

    'team.title': 'Team & Billing', 'team.one': '1 person × {price} = {total} every month', 'team.many': '{n} people × {price} = {total} every month',
    'team.trialFree': ' (free for your trial time)', 'team.staffLogin': 'Worker login', 'team.staffPw': 'Worker password', 'team.add': 'Add person ({price} / month)',
    'team.none': 'No worker dey yet — na only you dey use am.', 'team.added': 'Person don add.', 'team.confirmRemove': 'Remove this person? Dem no go fit log in again.',

    'co.title': 'Companies', 'co.help': 'All the businesses wey don register for StockLedger.', 'co.refresh': 'Refresh', 'co.business': 'Business', 'co.owner': 'Owner login',
    'co.plan': 'Plan', 'co.staff': 'Workers', 'co.joined': 'Joined', 'co.loading': 'Dey load companies…', 'co.one': 'We see 1 company.', 'co.many': 'We see {n} companies.',
    'co.none': 'We no see any company.', 'plan.trial': 'Trial', 'plan.active': 'Active subscription', 'plan.suspended': 'Suspended',

    'cr.title': 'Credit Sales & People Wey Dey Owe', 'cr.totalCredit': 'Total Credit Sales', 'cr.totalPaid': 'Total Payments', 'cr.outstanding': 'Money Wey Dem Still Owe', 'cr.customers': 'Customers',
    'cr.tabDebtors': 'People Wey Dey Owe', 'cr.tabSale': 'New Credit Sale', 'cr.tabPay': 'Record Payment', 'cr.register': 'List of People Wey Dey Owe', 'cr.name': 'Customer name',
    'cr.phone': 'Phone', 'cr.address': 'Address', 'cr.limit': 'Credit limit', 'cr.openingBal': 'Opening balance (money dem don dey owe before)', 'cr.notes': 'Notes',
    'cr.addDebtor': 'Add Person', 'cr.customer': 'Customer', 'cr.creditSales': 'Credit Sales', 'cr.payments': 'Payments', 'cr.balance': 'Balance', 'cr.ledger': 'Ledger',
    'cr.noDebtors': 'No customer yet.', 'cr.selectCustomer': 'Choose customer', 'cr.selectProduct': 'Choose product', 'cr.qty': 'How many', 'cr.unitPrice': 'Price for one',
    'cr.amountPaid': 'Money wey dem pay now', 'cr.dueDate': 'Date to pay', 'cr.saveSale': 'Save Credit Sale', 'cr.amount': 'Amount', 'cr.date': 'Date', 'cr.method': 'How dem pay',
    'cr.reference': 'Reference', 'cr.savePay': 'Save Payment', 'cr.cash': 'Cash', 'cr.transfer': 'Transfer', 'cr.pos': 'POS', 'cr.other': 'Other',
    'cr.nameReq': 'Customer name dey needed.', 'cr.saleInvalid': 'Choose customer, product and correct number.', 'cr.overSale': 'Payment no fit pass the sale amount.',
    'cr.saleDone': 'Credit sale don record. Balance: {amount}', 'cr.overLimit': 'This sale go make {name} owe {balance}, wey pass credit limit of {limit}. You wan continue?',
    'cr.payInvalid': 'Choose customer and put correct amount.', 'cr.overBalance': 'This payment pass the {balance} wey dem owe. You still wan record am?',
    'cr.payDone': 'Payment don record', 'cr.debtorAdded': 'Customer don add', 'cr.back': '← Go back', 'cr.ledgerTitle': '{name} — Customer Ledger',
    'cr.phoneAddr': 'Phone: {phone} · Address: {address}', 'cr.balanceLine': 'Money Wey Dem Still Owe: {amount}', 'cr.type': 'Type', 'cr.debit': 'Debit', 'cr.creditCol': 'Credit',
    'cr.typeSale': 'Credit Sale', 'cr.typePay': 'Payment', 'cr.typeOpen': 'Opening balance', 'cr.atSale': 'For the time of sale', 'cr.paymentAtSale': 'Payment for credit sale',

    'err.AUTH_REQUIRED': 'Your session don finish. Abeg sign in again.', 'err.LOGIN_INVALID': 'Login or password no correct.',
    'err.RATE_LIMITED': 'You don try too many times. Abeg wait small then try again.', 'err.BUSINESS_NAME': 'Put your business name (2–80 characters).',
    'err.USERNAME_INVALID': 'Login must be 3–100 characters and no space.', 'err.PASSWORD_INVALID': 'Password must be 8–128 characters.',
    'err.USERNAME_TAKEN': 'Person don already use that login.', 'err.FORBIDDEN': 'You no get permission to do that one.',
    'err.SUBSCRIPTION_ENDED': 'Your trial or subscription don finish. Renew so you fit dey save changes.', 'err.PAYLOAD_TOO_LARGE': 'Data too much. Download old reports then try again.',
    'err.CONFLICT': 'Another device save for the same time. Abeg try again.', 'err.RESET': 'Dem clear the data for another device. E dey reload…',
    'err.BAD_REQUEST': 'That request no correct.', 'err.STAFF_LIMIT': 'You don reach the maximum workers.', 'err.SERVER_ERROR': 'Wahala happen for our side. Abeg try again.',
    'err.NETWORK': 'We no fit reach the server. Check your network.'
  };

  const DICT = { en, ig, yo, ha, pcm };
  const STORAGE_KEY = 'sl_lang'; // deliberately not matched by the dc_/delite_ purge: language survives logout
  let lang = 'en';

  function detect() {
    try { const saved = root.localStorage && root.localStorage.getItem(STORAGE_KEY); if (saved && DICT[saved]) return saved; } catch (e) { /* storage blocked */ }
    const prefs = (root.navigator && (root.navigator.languages || [root.navigator.language])) || [];
    for (const p of prefs) { const base = String(p || '').toLowerCase().split('-')[0]; if (DICT[base]) return base; }
    return 'en';
  }

  function t(key, vars) {
    const table = DICT[lang] || en;
    let s = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : (Object.prototype.hasOwnProperty.call(en, key) ? en[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? vars[k] : m));
    return s;
  }

  function apply(scope) {
    const doc = root.document;
    if (!doc) return;
    const r = scope || doc;
    r.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    r.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)); });
    r.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    r.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', t(el.dataset.i18nTitle)); });
    r.querySelectorAll('[data-i18n-vars]').forEach(el => {
      const [key, ...pairs] = el.dataset.i18nVars.split('|');
      const vars = {}; pairs.forEach(p => { const i = p.indexOf('='); vars[p.slice(0, i)] = p.slice(i + 1); });
      el.textContent = t(key, vars);
    });
    if (r === doc) {
      doc.documentElement.lang = lang;
      doc.title = t('app.title');
      doc.querySelectorAll('select[data-lang-select]').forEach(sel => {
        if (!sel.options.length) Object.entries(LANGS).forEach(([code, name]) => { const o = doc.createElement('option'); o.value = code; o.textContent = name; sel.appendChild(o); });
        sel.value = lang;
      });
    }
  }

  function setLang(next) {
    if (!DICT[next]) return;
    lang = next;
    try { root.localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    apply();
    if (root.document) root.document.dispatchEvent(new root.CustomEvent('sl:lang', { detail: next }));
  }

  function init() {
    lang = detect();
    apply();
    root.document.querySelectorAll('select[data-lang-select]').forEach(sel => sel.addEventListener('change', () => setLang(sel.value)));
  }

  const api = { t, apply, setLang, init, langs: LANGS, get lang() { return lang; }, DICT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.I18N = api;
    lang = detect();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
