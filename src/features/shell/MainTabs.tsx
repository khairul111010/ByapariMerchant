import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { usePendingOrder } from '../../store/pendingOrder';
import { TabBar } from '../../ui/TabBar';
import { DashboardScreen } from '../dashboard/DashboardScreen';
import { OrdersTab } from '../orders/OrdersTab';
import { ProductsTab } from '../products/ProductsTab';
import { SellTab } from '../sell/SellTab';
import { MoreScreen } from './MoreScreen';

const Tab = createBottomTabNavigator();

/** A push tap asks for an order; bring the Orders tab forward so it can open it. */
function OpenOrderFromPush() {
  const nav = useNavigation<{ navigate: (name: string) => void }>();
  const orderId = usePendingOrder(s => s.orderId);
  useEffect(() => {
    if (orderId !== null) {
      nav.navigate('Orders');
    }
  }, [orderId, nav]);
  return null;
}

export function MainTabs() {
  const { t } = useTranslation();
  return (
    <>
      <OpenOrderFromPush />
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: t('tabs.dashboard') }}
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
          name="Sell"
          component={SellTab}
          options={{ title: t('tabs.sell') }}
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
