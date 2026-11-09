import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useJump } from '../../store/jump';
import { usePendingOrder } from '../../store/pendingOrder';
import { TabBar } from '../../ui/TabBar';
import { useTheme } from '../../ui/ThemeProvider';
import { HomeScreen } from '../home/HomeScreen';
import { OrdersTab } from '../orders/OrdersTab';
import { ProductsTab } from '../products/ProductsTab';
import { MoreScreen } from './MoreScreen';

const Tab = createBottomTabNavigator();

/** Brings the right tab forward when a push tap or a jump (Home tile, "+" sheet) asks for it. */
function TabSwitcher() {
  const nav = useNavigation<{ navigate: (name: string) => void }>();
  const orderId = usePendingOrder(s => s.orderId);
  const jump = useJump(s => s.target);
  useEffect(() => {
    if (orderId !== null) {
      nav.navigate('Orders');
    }
  }, [orderId, nav]);
  useEffect(() => {
    if (jump) {
      nav.navigate(jump.tab);
    }
  }, [jump, nav]);
  return null;
}

/**
 * Four tabs around a centre "+": Home, Orders | + | Products, More. The less frequent selling tools
 * (customers, coupons, reviews...) live in More; the counter sale is also on Home and in "+".
 */
export function MainTabs() {
  const { t } = useTranslation();
  const { c } = useTheme();
  return (
    <>
      <TabSwitcher />
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // Short screens fill the page colour all the way down to the bar.
          sceneStyle: { backgroundColor: c.background },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{ title: t('tabs.home') }}
        />
        <Tab.Screen
          name="Orders"
          component={OrdersTab}
          options={{ title: t('tabs.orders') }}
        />
        <Tab.Screen
          name="Products"
          component={ProductsTab}
          options={{ title: t('tabs.products') }}
        />
        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{ title: t('tabs.more') }}
        />
      </Tab.Navigator>
    </>
  );
}
