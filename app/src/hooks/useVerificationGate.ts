import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { showAlert, showConfirm } from '../utils/alert';

/**
 * Hook that checks verification status before allowing an action.
 * Returns { isVerified, requireVerification }.
 *
 * Usage:
 *   const { requireVerification } = useVerificationGate();
 *   const handleBook = () => {
 *     if (requireVerification()) return; // blocked, user prompted
 *     // proceed with booking...
 *   };
 */
export function useVerificationGate() {
  const { user } = useAuthStore();
  const router = useRouter();

  const isVerified = user?.verificationStatus === 'approved';
  const isPending = user?.verificationStatus === 'pending_review';

  /**
   * Call before a gated action. Returns true if action should be blocked.
   * Shows an alert and optionally redirects to verification flow.
   */
  const requireVerification = (): boolean => {
    if (isVerified) return false;

    if (isPending) {
      showAlert(
        'Verification Pending',
        'Your verification is being reviewed. You will be able to book once approved.',
      );
      return true;
    }

    showConfirm(
      'Verification Required',
      'Complete identity verification to book dates and make payments.',
      () => {
        if (user?.role === 'seeker') {
          router.push('/(seeker-verify)/intro');
        } else {
          router.push('/(comp-onboard)/step2');
        }
      },
      'Verify Now',
      'Later',
    );
    return true;
  };

  return { isVerified, isPending, requireVerification };
}
