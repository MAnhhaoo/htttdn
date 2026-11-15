import { AvatarUploadField as SharedAvatarUploadField } from '@shared/components/ui/AvatarUploadField';
import { usersApi } from '../../api';

export function AvatarUploadField({ uploadFn, ...props }) {
  return (
    <SharedAvatarUploadField
      uploadFn={uploadFn || usersApi.uploadAvatar}
      {...props}
    />
  );
}

export default AvatarUploadField;
