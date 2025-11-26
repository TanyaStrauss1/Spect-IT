import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

// Sample products (in a real app, these would come from an API)
const sampleProducts = [
  {
    id: 1,
    name: 'Premium Eyeglass Frames',
    brand: 'Ray-Ban',
    price: 1299,
    image: '🕶️',
    description: 'Classic aviator style frames',
  },
  {
    id: 2,
    name: 'Blue Light Blocking Glasses',
    brand: 'Gunnar',
    price: 899,
    image: '👓',
    description: 'Protect your eyes from screen glare',
  },
  {
    id: 3,
    name: 'Sunglasses Collection',
    brand: 'Oakley',
    price: 1599,
    image: '🕶️',
    description: 'UV protection sunglasses',
  },
];

export default function ShopScreen({ navigation }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
    // In a real app, this would update a global cart state
  };

  const formatPrice = (price) => {
    return `R${price.toLocaleString('en-ZA')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop</Text>
          <Text style={styles.subtitle}>Browse eyewear products from trusted retailers</Text>
        </View>

        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>Professional Eyewear Collection</Text>
          <Text style={styles.premiumBadgeSubtext}>
            Curated selection of clinically-tested optical products
          </Text>
        </View>

        <View style={styles.productsGrid}>
          {sampleProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <Text style={styles.productImage}>{product.image}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => addToCart(product)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {cart.length > 0 && (
          <View style={styles.cartSummary}>
            <Text style={styles.cartSummaryText}>
              {cart.length} item{cart.length > 1 ? 's' : ''} in cart
            </Text>
          </View>
        )}

        <View style={styles.trustIndicators}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✅</Text>
            <Text style={styles.trustText}>HPCSA Certified</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✅</Text>
            <Text style={styles.trustText}>Authentic Products</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✅</Text>
            <Text style={styles.trustText}>Prescription Verified</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  premiumBadge: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumBadgeSubtext: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  productsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    backgroundColor: Colors.light,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    fontSize: 64,
  },
  productInfo: {
    padding: 16,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cartSummary: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  cartSummaryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  trustIcon: {
    fontSize: 16,
  },
  trustText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '500',
  },
});
