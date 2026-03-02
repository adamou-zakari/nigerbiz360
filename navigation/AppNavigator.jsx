import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import SalesScreen from '../screens/SalesScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AideScreen from '../screens/AideScreen';
import ConfidentialiteScreen from '../screens/ConfidentialiteScreen';

import { observerAuth, getProfilComercant } from '../services/authService';
import useStore from '../store/useStore';
import { COLORS, FONTS } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: {
        height: 75,
        paddingBottom: 12,
        paddingTop: 8,
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        elevation: 12,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Accueil',
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Produits"
      component={ProductsScreen}
      options={{
        tabBarLabel: 'Mon Stock',
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={focused ? 'cube' : 'cube-outline'} size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Ventes"
      component={SalesScreen}
      options={{
        tabBarLabel: 'Vendre',
        tabBarIcon: ({ focused }) => (
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: COLORS.primary,
            alignItems: 'center', justifyContent: 'center',
            marginTop: -20, elevation: 6,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.5,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}>
            <Ionicons name="add" size={32} color="white" />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          color: COLORS.primary,
          marginTop: 6,
        },
      }}
    />
    <Tab.Screen
      name="Historique"
      component={HistoryScreen}
      options={{
        tabBarLabel: 'Mes Ventes',
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profil"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Mon Compte',
        tabBarIcon: ({ focused, color }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, setUser, setProfil } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observerAuth(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profil = await getProfilComercant(firebaseUser.uid);
          setProfil(profil);
        } else {
          setUser(null);
          setProfil(null);
        }
      } catch (error) {
        console.log('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.background,
      }}>
        <Text style={{
          fontSize: 28, fontWeight: '900',
          color: COLORS.primary, marginBottom: 16,
        }}>
          NIGER<Text style={{ color: COLORS.secondary }}>BIZ</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 18 }}> 360</Text>
        </Text>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Facture"
              component={InvoiceScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Aide" component={AideScreen} />
            <Stack.Screen name="Confidentialite" component={ConfidentialiteScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;