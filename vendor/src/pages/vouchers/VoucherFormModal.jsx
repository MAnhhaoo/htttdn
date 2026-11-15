import { BaseVoucherFormModal } from '@shared/components/common/BaseVoucherFormModal';
import { voucherService } from '../../services/voucherService';
import { productService } from '../../services/productService';

export default function VoucherFormModal({ isOpen, onClose, voucherToEdit, onSave }) {
  const handleSavePayload = async (payload) => {
    if (voucherToEdit) {
      await voucherService.updateVoucher(voucherToEdit.id, payload);
    } else {
      await voucherService.createVoucher(payload);
    }
    await onSave?.();
  };

  return (
    <BaseVoucherFormModal
      mode="vendor"
      isOpen={isOpen}
      onClose={onClose}
      voucherToEdit={voucherToEdit}
      onSave={handleSavePayload}
      fetchVendorProductsFn={productService.getVendorProducts}
    />
  );
}
