import { defaultTranslations } from '../src/localization/defaultTranslations';

export const en = { ...defaultTranslations };

export const ar = {
  ...defaultTranslations,
  clearSort: 'مسح الترتيب',
  noRows: 'لا توجد صفوف',
  rowsPerPage: 'صفوف في الصفحة',
  paginationRange: '{{from}}–{{to}} من {{count}}',
  firstPage: 'الصفحة الأولى',
  lastPage: 'آخر صفحة',
  prevPage: 'السابق',
  nextPage: 'التالي',
  save: 'حفظ',
  cancel: 'إلغاء',
  validationErrors: 'يرجى تصحيح ما يلي:',
  filterPlaceholder: 'تصفية',
  selectOption: 'اختر',
};
