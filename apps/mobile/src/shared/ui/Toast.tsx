import { StyleSheet, Text, View } from 'react-native';
import Toast, { type ToastConfig, type ToastConfigParams } from 'react-native-toast-message';
import Svg, { Circle, Path } from 'react-native-svg';

export type AppToastType = 'success' | 'error' | 'warning' | 'info';

type AppToastProps = {
  text: string;
  type: AppToastType;
};

const BOTTOM_NAV_HEIGHT = 84;
const TOAST_BOTTOM_GAP = 16;

const toastStyles: Record<AppToastType, { iconColor: string }> = {
  success: {
    iconColor: '#10B981',
  },
  error: {
    iconColor: '#EF4444',
  },
  warning: {
    iconColor: '#FBBF24',
  },
  info: {
    iconColor: '#3B82F6',
  },
};

function ToastIcon({ type, color }: { type: AppToastType; color: string }) {
  if (type === 'error') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={11} fill={color} />
        <Path d="M8 8L16 16M16 8L8 16" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
      </Svg>
    );
  }

  if (type === 'warning') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={11} fill={color} />
        <Path
          d="M11.4474 6.06003C11.6217 5.98327 11.8101 5.94372 12.0006 5.94388C12.1909 5.94392 12.3791 5.98364 12.5532 6.06048C12.7273 6.13732 12.8835 6.24961 13.0118 6.39018C13.1401 6.53075 13.2377 6.69652 13.2983 6.87691C13.359 7.0573 13.3814 7.24835 13.3641 7.43788L12.8181 13.4469C12.7968 13.6489 12.7015 13.8359 12.5506 13.9718C12.3996 14.1078 12.2037 14.183 12.0006 14.183C11.7974 14.183 11.6015 14.1078 11.4505 13.9718C11.2996 13.8359 11.2043 13.6489 11.1831 13.4469L10.6356 7.43788C10.6182 7.24823 10.6407 7.05705 10.7014 6.87656C10.7622 6.69606 10.8599 6.53022 10.9883 6.38963C11.1168 6.24904 11.2732 6.13678 11.4474 6.06003Z"
          fill="#FFFFFF"
        />
        <Path
          d="M13.3091 16.7476C13.3091 17.4703 12.7233 18.0561 12.0006 18.0561C11.278 18.0561 10.6921 17.4703 10.6921 16.7476C10.6921 16.025 11.278 15.4392 12.0006 15.4392C12.7233 15.4392 13.3091 16.025 13.3091 16.7476Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }

  if (type === 'info') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={11} fill={color} />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.63303 10.8132C9.63303 10.261 10.0807 9.81325 10.633 9.81325H11.9998C12.5521 9.81325 12.9998 10.261 12.9998 10.8132V15.47H14.2057C14.758 15.47 15.2057 15.9177 15.2057 16.47C15.2057 17.0223 14.758 17.47 14.2057 17.47H9.79395C9.24166 17.47 8.79395 17.0223 8.79395 16.47C8.79395 15.9177 9.24166 15.47 9.79395 15.47H10.9998V11.8132H10.633C10.0807 11.8132 9.63303 11.3655 9.63303 10.8132Z"
          fill="#FFFFFF"
        />
        <Path
          d="M13.2324 7.83848C13.2324 8.56114 12.6466 9.14697 11.924 9.14697C11.2013 9.14697 10.6155 8.56114 10.6155 7.83848C10.6155 7.11583 11.2013 6.53 11.924 6.53C12.6466 6.53 13.2324 7.11583 13.2324 7.83848Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={color} />
      <Path
        d="M16.7914 8.83148C16.4022 8.41223 15.7569 8.40571 15.3599 8.81809L10.8901 13.4621L8.63989 11.1242C8.24296 10.7118 7.59767 10.7184 7.20842 11.1376C6.82884 11.5465 6.83408 12.1967 7.22108 12.5987L10.8901 16.4106L16.7788 10.2926C17.1658 9.89053 17.171 9.24032 16.7914 8.83148Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function AppToastContent({ text, type }: AppToastProps) {
  const { iconColor } = toastStyles[type];

  return (
    <View style={styles.container}>
      <View style={styles.iconSlot}>
        <ToastIcon type={type} color={iconColor} />
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const renderToast =
  (type: AppToastType) =>
  ({ text1 }: ToastConfigParams<unknown>) => <AppToastContent type={type} text={text1 ?? ''} />;

export const appToastConfig: ToastConfig = {
  success: renderToast('success'),
  error: renderToast('error'),
  warning: renderToast('warning'),
  info: renderToast('info'),
};

export function AppToast() {
  return (
    <Toast
      config={appToastConfig}
      position="bottom"
      bottomOffset={BOTTOM_NAV_HEIGHT + TOAST_BOTTOM_GAP}
      visibilityTime={2600}
    />
  );
}

export function showAppToast({ type, text }: AppToastProps) {
  Toast.show({
    type,
    text1: text,
    position: 'bottom',
    bottomOffset: BOTTOM_NAV_HEIGHT + TOAST_BOTTOM_GAP,
  });
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    minHeight: 56,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: '#555555',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  iconSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
