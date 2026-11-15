import { BaseVoucherFormModal } from '@shared/components/common/BaseVoucherFormModal';
import { categoriesApi } from '../../api';

export default function VoucherFormModal({ isOpen, onClose, voucherToEdit, onSave }) {
  return (
    <BaseVoucherFormModal
      mode="admin"
      isOpen={isOpen}
      onClose={onClose}
      voucherToEdit={voucherToEdit}
      onSave={onSave}
      fetchCategoriesFn={categoriesApi.getCategories}
    />
  );
}
