import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','fullName','email','phone','password','avatar','gender','address','status','role','createdAt','updatedAt','deletedAt']);

export const CategoryScalarFieldEnumSchema = z.enum(['id','name','slug','icon','imageUrl','description','createdAt','updatedAt','deletedAt']);

export const ProductScalarFieldEnumSchema = z.enum(['id','name','slug','description','categoryId','sellerId','status','createdAt','updatedAt','deletedAt']);

export const ProductColorScalarFieldEnumSchema = z.enum(['id','productId','color','imageUrl','createdAt','updatedAt','deletedAt']);

export const ProductVariantScalarFieldEnumSchema = z.enum(['id','productColorId','storage','sku','price','salePrice','stock','createdAt','updatedAt','deletedAt']);

export const CartScalarFieldEnumSchema = z.enum(['id','userId','createdAt','updatedAt']);

export const CartItemScalarFieldEnumSchema = z.enum(['id','cartId','productVariantId','quantity','createdAt','updatedAt']);

export const OrderScalarFieldEnumSchema = z.enum(['id','userId','orderCode','orderDate','totalAmount','status','notes','createdAt','updatedAt','cancelledAt']);

export const OrderItemScalarFieldEnumSchema = z.enum(['id','orderId','productVariantId','quantity','price','createdAt']);

export const PaymentScalarFieldEnumSchema = z.enum(['id','orderId','method','status','amount','transactionId','createdAt','updatedAt','cancelledAt']);

export const ReviewScalarFieldEnumSchema = z.enum(['id','userId','productId','description','star','createdAt','updatedAt','deletedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const UserStatusSchema = z.enum(['active','inactive']);

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

export const UserRoleSchema = z.enum(['customer','seller','admin']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export const ProductStatusSchema = z.enum(['active','inactive','draft']);

export type ProductStatusType = `${z.infer<typeof ProductStatusSchema>}`

export const OrderStatusSchema = z.enum(['pending','confirmed','processing','shipping','completed','cancelled']);

export type OrderStatusType = `${z.infer<typeof OrderStatusSchema>}`

export const PaymentStatusSchema = z.enum(['pending','success','failed','cancelled','refunded']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

export const PaymentMethodSchema = z.enum(['cod','vnpay','momo','zalopay','bank_transfer']);

export type PaymentMethodType = `${z.infer<typeof PaymentMethodSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  status: UserStatusSchema,
  role: UserRoleSchema,
  id: z.uuid(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  password: z.string(),
  avatar: z.string().nullable(),
  gender: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// CATEGORY SCHEMA
/////////////////////////////////////////

export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
  imageUrl: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Category = z.infer<typeof CategorySchema>

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  status: ProductStatusSchema,
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  categoryId: z.string(),
  sellerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Product = z.infer<typeof ProductSchema>

/////////////////////////////////////////
// PRODUCT COLOR SCHEMA
/////////////////////////////////////////

export const ProductColorSchema = z.object({
  id: z.uuid(),
  productId: z.string(),
  color: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type ProductColor = z.infer<typeof ProductColorSchema>

/////////////////////////////////////////
// PRODUCT VARIANT SCHEMA
/////////////////////////////////////////

export const ProductVariantSchema = z.object({
  id: z.uuid(),
  productColorId: z.string(),
  storage: z.string().nullable(),
  sku: z.string(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'ProductVariant']"}),
  salePrice: z.instanceof(Prisma.Decimal, { message: "Field 'salePrice' must be a Decimal. Location: ['Models', 'ProductVariant']"}).nullable(),
  stock: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type ProductVariant = z.infer<typeof ProductVariantSchema>

/////////////////////////////////////////
// CART SCHEMA
/////////////////////////////////////////

export const CartSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Cart = z.infer<typeof CartSchema>

/////////////////////////////////////////
// CART ITEM SCHEMA
/////////////////////////////////////////

export const CartItemSchema = z.object({
  id: z.uuid(),
  cartId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CartItem = z.infer<typeof CartItemSchema>

/////////////////////////////////////////
// ORDER SCHEMA
/////////////////////////////////////////

export const OrderSchema = z.object({
  status: OrderStatusSchema,
  id: z.uuid(),
  userId: z.string(),
  orderCode: z.string(),
  orderDate: z.coerce.date(),
  totalAmount: z.instanceof(Prisma.Decimal, { message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
})

export type Order = z.infer<typeof OrderSchema>

/////////////////////////////////////////
// ORDER ITEM SCHEMA
/////////////////////////////////////////

export const OrderItemSchema = z.object({
  id: z.uuid(),
  orderId: z.string(),
  productVariantId: z.string().nullable(),
  quantity: z.number().int(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'OrderItem']"}),
  createdAt: z.coerce.date(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  id: z.uuid(),
  orderId: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Payment']"}),
  transactionId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
})

export type Payment = z.infer<typeof PaymentSchema>

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  productId: z.string(),
  description: z.string().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Review = z.infer<typeof ReviewSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  orders: z.boolean().optional(),
  reviews: z.boolean().optional(),
  products: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  fullName: z.boolean().optional(),
  email: z.boolean().optional(),
  phone: z.boolean().optional(),
  password: z.boolean().optional(),
  avatar: z.boolean().optional(),
  gender: z.boolean().optional(),
  address: z.boolean().optional(),
  status: z.boolean().optional(),
  role: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CATEGORY
//------------------------------------------------------

export const CategoryIncludeSchema: z.ZodType<Prisma.CategoryInclude> = z.object({
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const CategoryArgsSchema: z.ZodType<Prisma.CategoryDefaultArgs> = z.object({
  select: z.lazy(() => CategorySelectSchema).optional(),
  include: z.lazy(() => CategoryIncludeSchema).optional(),
}).strict();

export const CategoryCountOutputTypeArgsSchema: z.ZodType<Prisma.CategoryCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CategoryCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CategoryCountOutputTypeSelectSchema: z.ZodType<Prisma.CategoryCountOutputTypeSelect> = z.object({
  products: z.boolean().optional(),
}).strict();

export const CategorySelectSchema: z.ZodType<Prisma.CategorySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  icon: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  description: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PRODUCT
//------------------------------------------------------

export const ProductIncludeSchema: z.ZodType<Prisma.ProductInclude> = z.object({
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  seller: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  colors: z.union([z.boolean(),z.lazy(() => ProductColorFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const ProductArgsSchema: z.ZodType<Prisma.ProductDefaultArgs> = z.object({
  select: z.lazy(() => ProductSelectSchema).optional(),
  include: z.lazy(() => ProductIncludeSchema).optional(),
}).strict();

export const ProductCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProductCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductCountOutputTypeSelect> = z.object({
  colors: z.boolean().optional(),
  reviews: z.boolean().optional(),
}).strict();

export const ProductSelectSchema: z.ZodType<Prisma.ProductSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  description: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  sellerId: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  seller: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  colors: z.union([z.boolean(),z.lazy(() => ProductColorFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PRODUCT COLOR
//------------------------------------------------------

export const ProductColorIncludeSchema: z.ZodType<Prisma.ProductColorInclude> = z.object({
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  variants: z.union([z.boolean(),z.lazy(() => ProductVariantFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductColorCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const ProductColorArgsSchema: z.ZodType<Prisma.ProductColorDefaultArgs> = z.object({
  select: z.lazy(() => ProductColorSelectSchema).optional(),
  include: z.lazy(() => ProductColorIncludeSchema).optional(),
}).strict();

export const ProductColorCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductColorCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductColorCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProductColorCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductColorCountOutputTypeSelect> = z.object({
  variants: z.boolean().optional(),
}).strict();

export const ProductColorSelectSchema: z.ZodType<Prisma.ProductColorSelect> = z.object({
  id: z.boolean().optional(),
  productId: z.boolean().optional(),
  color: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  variants: z.union([z.boolean(),z.lazy(() => ProductVariantFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductColorCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PRODUCT VARIANT
//------------------------------------------------------

export const ProductVariantIncludeSchema: z.ZodType<Prisma.ProductVariantInclude> = z.object({
  productColor: z.union([z.boolean(),z.lazy(() => ProductColorArgsSchema)]).optional(),
  cartItems: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  orderItems: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductVariantCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const ProductVariantArgsSchema: z.ZodType<Prisma.ProductVariantDefaultArgs> = z.object({
  select: z.lazy(() => ProductVariantSelectSchema).optional(),
  include: z.lazy(() => ProductVariantIncludeSchema).optional(),
}).strict();

export const ProductVariantCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductVariantCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductVariantCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProductVariantCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductVariantCountOutputTypeSelect> = z.object({
  cartItems: z.boolean().optional(),
  orderItems: z.boolean().optional(),
}).strict();

export const ProductVariantSelectSchema: z.ZodType<Prisma.ProductVariantSelect> = z.object({
  id: z.boolean().optional(),
  productColorId: z.boolean().optional(),
  storage: z.boolean().optional(),
  sku: z.boolean().optional(),
  price: z.boolean().optional(),
  salePrice: z.boolean().optional(),
  stock: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  productColor: z.union([z.boolean(),z.lazy(() => ProductColorArgsSchema)]).optional(),
  cartItems: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  orderItems: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductVariantCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CART
//------------------------------------------------------

export const CartIncludeSchema: z.ZodType<Prisma.CartInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CartCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const CartArgsSchema: z.ZodType<Prisma.CartDefaultArgs> = z.object({
  select: z.lazy(() => CartSelectSchema).optional(),
  include: z.lazy(() => CartIncludeSchema).optional(),
}).strict();

export const CartCountOutputTypeArgsSchema: z.ZodType<Prisma.CartCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CartCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CartCountOutputTypeSelectSchema: z.ZodType<Prisma.CartCountOutputTypeSelect> = z.object({
  items: z.boolean().optional(),
}).strict();

export const CartSelectSchema: z.ZodType<Prisma.CartSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CartCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CART ITEM
//------------------------------------------------------

export const CartItemIncludeSchema: z.ZodType<Prisma.CartItemInclude> = z.object({
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
}).strict();

export const CartItemArgsSchema: z.ZodType<Prisma.CartItemDefaultArgs> = z.object({
  select: z.lazy(() => CartItemSelectSchema).optional(),
  include: z.lazy(() => CartItemIncludeSchema).optional(),
}).strict();

export const CartItemSelectSchema: z.ZodType<Prisma.CartItemSelect> = z.object({
  id: z.boolean().optional(),
  cartId: z.boolean().optional(),
  productVariantId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
}).strict()

// ORDER
//------------------------------------------------------

export const OrderIncludeSchema: z.ZodType<Prisma.OrderInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  payments: z.union([z.boolean(),z.lazy(() => PaymentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const OrderArgsSchema: z.ZodType<Prisma.OrderDefaultArgs> = z.object({
  select: z.lazy(() => OrderSelectSchema).optional(),
  include: z.lazy(() => OrderIncludeSchema).optional(),
}).strict();

export const OrderCountOutputTypeArgsSchema: z.ZodType<Prisma.OrderCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => OrderCountOutputTypeSelectSchema).nullish(),
}).strict();

export const OrderCountOutputTypeSelectSchema: z.ZodType<Prisma.OrderCountOutputTypeSelect> = z.object({
  items: z.boolean().optional(),
  payments: z.boolean().optional(),
}).strict();

export const OrderSelectSchema: z.ZodType<Prisma.OrderSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  orderCode: z.boolean().optional(),
  orderDate: z.boolean().optional(),
  totalAmount: z.boolean().optional(),
  status: z.boolean().optional(),
  notes: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  cancelledAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  payments: z.union([z.boolean(),z.lazy(() => PaymentFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ORDER ITEM
//------------------------------------------------------

export const OrderItemIncludeSchema: z.ZodType<Prisma.OrderItemInclude> = z.object({
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
}).strict();

export const OrderItemArgsSchema: z.ZodType<Prisma.OrderItemDefaultArgs> = z.object({
  select: z.lazy(() => OrderItemSelectSchema).optional(),
  include: z.lazy(() => OrderItemIncludeSchema).optional(),
}).strict();

export const OrderItemSelectSchema: z.ZodType<Prisma.OrderItemSelect> = z.object({
  id: z.boolean().optional(),
  orderId: z.boolean().optional(),
  productVariantId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  price: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
}).strict()

// PAYMENT
//------------------------------------------------------

export const PaymentIncludeSchema: z.ZodType<Prisma.PaymentInclude> = z.object({
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict();

export const PaymentArgsSchema: z.ZodType<Prisma.PaymentDefaultArgs> = z.object({
  select: z.lazy(() => PaymentSelectSchema).optional(),
  include: z.lazy(() => PaymentIncludeSchema).optional(),
}).strict();

export const PaymentSelectSchema: z.ZodType<Prisma.PaymentSelect> = z.object({
  id: z.boolean().optional(),
  orderId: z.boolean().optional(),
  method: z.boolean().optional(),
  status: z.boolean().optional(),
  amount: z.boolean().optional(),
  transactionId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  cancelledAt: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict()

// REVIEW
//------------------------------------------------------

export const ReviewIncludeSchema: z.ZodType<Prisma.ReviewInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict();

export const ReviewArgsSchema: z.ZodType<Prisma.ReviewDefaultArgs> = z.object({
  select: z.lazy(() => ReviewSelectSchema).optional(),
  include: z.lazy(() => ReviewIncludeSchema).optional(),
}).strict();

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  productId: z.boolean().optional(),
  description: z.boolean().optional(),
  star: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  fullName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  avatar: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  gender: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  address: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  cart: z.union([ z.lazy(() => CartNullableScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  phone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  avatar: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  address: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  cart: z.lazy(() => CartOrderByWithRelationInputSchema).optional(),
  orders: z.lazy(() => OrderOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
});

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    email: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  fullName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  avatar: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  gender: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  address: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  cart: z.union([ z.lazy(() => CartNullableScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
}));

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  phone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  avatar: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  gender: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  address: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
});

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  fullName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  phone: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  avatar: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  gender: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  address: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumUserStatusWithAggregatesFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleWithAggregatesFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const CategoryWhereInputSchema: z.ZodType<Prisma.CategoryWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  icon: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
});

export const CategoryOrderByWithRelationInputSchema: z.ZodType<Prisma.CategoryOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  icon: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
});

export const CategoryWhereUniqueInputSchema: z.ZodType<Prisma.CategoryWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    slug: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  icon: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
}));

export const CategoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.CategoryOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  icon: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => CategoryCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CategoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CategoryMinOrderByAggregateInputSchema).optional(),
});

export const CategoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CategoryScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema), z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema), z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  icon: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductWhereInputSchema: z.ZodType<Prisma.ProductWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sellerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  seller: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  colors: z.lazy(() => ProductColorListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
});

export const ProductOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  sellerId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  category: z.lazy(() => CategoryOrderByWithRelationInputSchema).optional(),
  seller: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  colors: z.lazy(() => ProductColorOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
});

export const ProductWhereUniqueInputSchema: z.ZodType<Prisma.ProductWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    slug: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sellerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  seller: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  colors: z.lazy(() => ProductColorListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
}));

export const ProductOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  sellerId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ProductCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProductMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProductMinOrderByAggregateInputSchema).optional(),
});

export const ProductScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  categoryId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  sellerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumProductStatusWithAggregatesFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductColorWhereInputSchema: z.ZodType<Prisma.ProductColorWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductColorWhereInputSchema), z.lazy(() => ProductColorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductColorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductColorWhereInputSchema), z.lazy(() => ProductColorWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  variants: z.lazy(() => ProductVariantListRelationFilterSchema).optional(),
});

export const ProductColorOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductColorOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  variants: z.lazy(() => ProductVariantOrderByRelationAggregateInputSchema).optional(),
});

export const ProductColorWhereUniqueInputSchema: z.ZodType<Prisma.ProductColorWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    productId_color: z.lazy(() => ProductColorProductIdColorCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    productId_color: z.lazy(() => ProductColorProductIdColorCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  productId_color: z.lazy(() => ProductColorProductIdColorCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ProductColorWhereInputSchema), z.lazy(() => ProductColorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductColorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductColorWhereInputSchema), z.lazy(() => ProductColorWhereInputSchema).array() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  variants: z.lazy(() => ProductVariantListRelationFilterSchema).optional(),
}));

export const ProductColorOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductColorOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ProductColorCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProductColorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProductColorMinOrderByAggregateInputSchema).optional(),
});

export const ProductColorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductColorScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductColorScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductColorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductColorScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductColorScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductColorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductVariantWhereInputSchema: z.ZodType<Prisma.ProductVariantWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductVariantWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productColorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  storage: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  sku: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  salePrice: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  stock: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  productColor: z.union([ z.lazy(() => ProductColorScalarRelationFilterSchema), z.lazy(() => ProductColorWhereInputSchema) ]).optional(),
  cartItems: z.lazy(() => CartItemListRelationFilterSchema).optional(),
  orderItems: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
});

export const ProductVariantOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductVariantOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  storage: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sku: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  productColor: z.lazy(() => ProductColorOrderByWithRelationInputSchema).optional(),
  cartItems: z.lazy(() => CartItemOrderByRelationAggregateInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemOrderByRelationAggregateInputSchema).optional(),
});

export const ProductVariantWhereUniqueInputSchema: z.ZodType<Prisma.ProductVariantWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    sku: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    sku: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  sku: z.string().optional(),
  AND: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductVariantWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  productColorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  storage: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  salePrice: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  stock: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  productColor: z.union([ z.lazy(() => ProductColorScalarRelationFilterSchema), z.lazy(() => ProductColorWhereInputSchema) ]).optional(),
  cartItems: z.lazy(() => CartItemListRelationFilterSchema).optional(),
  orderItems: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
}));

export const ProductVariantOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductVariantOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  storage: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sku: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ProductVariantCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ProductVariantAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProductVariantMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProductVariantMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ProductVariantSumOrderByAggregateInputSchema).optional(),
});

export const ProductVariantScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductVariantScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductVariantScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductVariantScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductVariantScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductVariantScalarWhereWithAggregatesInputSchema), z.lazy(() => ProductVariantScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productColorId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  storage: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  sku: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  salePrice: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  stock: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const CartWhereInputSchema: z.ZodType<Prisma.CartWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartWhereInputSchema), z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartWhereInputSchema), z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  items: z.lazy(() => CartItemListRelationFilterSchema).optional(),
});

export const CartOrderByWithRelationInputSchema: z.ZodType<Prisma.CartOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  items: z.lazy(() => CartItemOrderByRelationAggregateInputSchema).optional(),
});

export const CartWhereUniqueInputSchema: z.ZodType<Prisma.CartWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    userId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    userId: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => CartWhereInputSchema), z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartWhereInputSchema), z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  items: z.lazy(() => CartItemListRelationFilterSchema).optional(),
}));

export const CartOrderByWithAggregationInputSchema: z.ZodType<Prisma.CartOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CartCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CartMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CartMinOrderByAggregateInputSchema).optional(),
});

export const CartScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CartScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartScalarWhereWithAggregatesInputSchema), z.lazy(() => CartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartScalarWhereWithAggregatesInputSchema), z.lazy(() => CartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const CartItemWhereInputSchema: z.ZodType<Prisma.CartItemWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartItemWhereInputSchema), z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartItemWhereInputSchema), z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cart: z.union([ z.lazy(() => CartScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
});

export const CartItemOrderByWithRelationInputSchema: z.ZodType<Prisma.CartItemOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cart: z.lazy(() => CartOrderByWithRelationInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantOrderByWithRelationInputSchema).optional(),
});

export const CartItemWhereUniqueInputSchema: z.ZodType<Prisma.CartItemWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    cartId_productVariantId: z.lazy(() => CartItemCartIdProductVariantIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    cartId_productVariantId: z.lazy(() => CartItemCartIdProductVariantIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  cartId_productVariantId: z.lazy(() => CartItemCartIdProductVariantIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => CartItemWhereInputSchema), z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartItemWhereInputSchema), z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  cartId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cart: z.union([ z.lazy(() => CartScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
}));

export const CartItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.CartItemOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CartItemCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CartItemAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CartItemMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CartItemMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CartItemSumOrderByAggregateInputSchema).optional(),
});

export const CartItemScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CartItemScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartItemScalarWhereWithAggregatesInputSchema), z.lazy(() => CartItemScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartItemScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartItemScalarWhereWithAggregatesInputSchema), z.lazy(() => CartItemScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const OrderWhereInputSchema: z.ZodType<Prisma.OrderWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderCode: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  items: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
  payments: z.lazy(() => PaymentListRelationFilterSchema).optional(),
});

export const OrderOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  orderDate: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  items: z.lazy(() => OrderItemOrderByRelationAggregateInputSchema).optional(),
  payments: z.lazy(() => PaymentOrderByRelationAggregateInputSchema).optional(),
});

export const OrderWhereUniqueInputSchema: z.ZodType<Prisma.OrderWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    orderCode: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    orderCode: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string().optional(),
  AND: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  items: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
  payments: z.lazy(() => PaymentListRelationFilterSchema).optional(),
}));

export const OrderOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  orderDate: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => OrderCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => OrderAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => OrderSumOrderByAggregateInputSchema).optional(),
});

export const OrderScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  orderCode: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  orderDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusWithAggregatesFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const OrderItemWhereInputSchema: z.ZodType<Prisma.OrderItemWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderItemWhereInputSchema), z.lazy(() => OrderItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderItemWhereInputSchema), z.lazy(() => OrderItemWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantNullableScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional().nullable(),
});

export const OrderItemOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderItemOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantOrderByWithRelationInputSchema).optional(),
});

export const OrderItemWhereUniqueInputSchema: z.ZodType<Prisma.OrderItemWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => OrderItemWhereInputSchema), z.lazy(() => OrderItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderItemWhereInputSchema), z.lazy(() => OrderItemWhereInputSchema).array() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantNullableScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional().nullable(),
}));

export const OrderItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderItemOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => OrderItemCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => OrderItemAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderItemMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderItemMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => OrderItemSumOrderByAggregateInputSchema).optional(),
});

export const OrderItemScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderItemScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const PaymentWhereInputSchema: z.ZodType<Prisma.PaymentWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PaymentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  transactionId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
});

export const PaymentOrderByWithRelationInputSchema: z.ZodType<Prisma.PaymentOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
});

export const PaymentWhereUniqueInputSchema: z.ZodType<Prisma.PaymentWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PaymentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  transactionId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
}));

export const PaymentOrderByWithAggregationInputSchema: z.ZodType<Prisma.PaymentOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => PaymentCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => PaymentAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PaymentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PaymentMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => PaymentSumOrderByAggregateInputSchema).optional(),
});

export const PaymentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PaymentScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema), z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema), z.lazy(() => PaymentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodWithAggregatesFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusWithAggregatesFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  transactionId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ReviewWhereInputSchema: z.ZodType<Prisma.ReviewWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  star: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
});

export const ReviewOrderByWithRelationInputSchema: z.ZodType<Prisma.ReviewOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  star: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
});

export const ReviewWhereUniqueInputSchema: z.ZodType<Prisma.ReviewWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    userId_productId: z.lazy(() => ReviewUserIdProductIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    userId_productId: z.lazy(() => ReviewUserIdProductIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  userId_productId: z.lazy(() => ReviewUserIdProductIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  star: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
}));

export const ReviewOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReviewOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  star: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ReviewCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ReviewAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReviewMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReviewMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ReviewSumOrderByAggregateInputSchema).optional(),
});

export const ReviewScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReviewScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema), z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema), z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  star: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CategoryCreateInputSchema: z.ZodType<Prisma.CategoryCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  products: z.lazy(() => ProductCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export const CategoryUncheckedCreateInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export const CategoryUpdateInputSchema: z.ZodType<Prisma.CategoryUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icon: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  products: z.lazy(() => ProductUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export const CategoryUncheckedUpdateInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icon: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export const CategoryCreateManyInputSchema: z.ZodType<Prisma.CategoryCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CategoryUpdateManyMutationInputSchema: z.ZodType<Prisma.CategoryUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icon: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CategoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icon: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductCreateInputSchema: z.ZodType<Prisma.ProductCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutProductsInputSchema),
  seller: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateInputSchema: z.ZodType<Prisma.ProductUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  sellerId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUpdateInputSchema: z.ZodType<Prisma.ProductUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  seller: z.lazy(() => UserUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sellerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductCreateManyInputSchema: z.ZodType<Prisma.ProductCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  sellerId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sellerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductColorCreateInputSchema: z.ZodType<Prisma.ProductColorCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  product: z.lazy(() => ProductCreateNestedOneWithoutColorsInputSchema),
  variants: z.lazy(() => ProductVariantCreateNestedManyWithoutProductColorInputSchema).optional(),
});

export const ProductColorUncheckedCreateInputSchema: z.ZodType<Prisma.ProductColorUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedCreateNestedManyWithoutProductColorInputSchema).optional(),
});

export const ProductColorUpdateInputSchema: z.ZodType<Prisma.ProductColorUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutColorsNestedInputSchema).optional(),
  variants: z.lazy(() => ProductVariantUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorCreateManyInputSchema: z.ZodType<Prisma.ProductColorCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductColorUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductColorUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductColorUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductVariantCreateInputSchema: z.ZodType<Prisma.ProductVariantCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  productColor: z.lazy(() => ProductColorCreateNestedOneWithoutVariantsInputSchema),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUpdateInputSchema: z.ZodType<Prisma.ProductVariantUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productColor: z.lazy(() => ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantCreateManyInputSchema: z.ZodType<Prisma.ProductVariantCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductVariantUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductVariantUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductVariantUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CartCreateInputSchema: z.ZodType<Prisma.CartCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCartInputSchema),
  items: z.lazy(() => CartItemCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartUncheckedCreateInputSchema: z.ZodType<Prisma.CartUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  items: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartUpdateInputSchema: z.ZodType<Prisma.CartUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCartNestedInputSchema).optional(),
  items: z.lazy(() => CartItemUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const CartUncheckedUpdateInputSchema: z.ZodType<Prisma.CartUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => CartItemUncheckedUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const CartCreateManyInputSchema: z.ZodType<Prisma.CartCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartUpdateManyMutationInputSchema: z.ZodType<Prisma.CartUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CartUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemCreateInputSchema: z.ZodType<Prisma.CartItemCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutItemsInputSchema),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutCartItemsInputSchema),
});

export const CartItemUncheckedCreateInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  cartId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartItemUpdateInputSchema: z.ZodType<Prisma.CartItemUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cart: z.lazy(() => CartUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneRequiredWithoutCartItemsNestedInputSchema).optional(),
});

export const CartItemUncheckedUpdateInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cartId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemCreateManyInputSchema: z.ZodType<Prisma.CartItemCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  cartId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartItemUpdateManyMutationInputSchema: z.ZodType<Prisma.CartItemUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cartId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderCreateInputSchema: z.ZodType<Prisma.OrderCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  items: z.lazy(() => OrderItemCreateNestedManyWithoutOrderInputSchema).optional(),
  payments: z.lazy(() => PaymentCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateInputSchema: z.ZodType<Prisma.OrderUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  payments: z.lazy(() => PaymentUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUpdateInputSchema: z.ZodType<Prisma.OrderUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  items: z.lazy(() => OrderItemUpdateManyWithoutOrderNestedInputSchema).optional(),
  payments: z.lazy(() => PaymentUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  items: z.lazy(() => OrderItemUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  payments: z.lazy(() => PaymentUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderCreateManyInputSchema: z.ZodType<Prisma.OrderCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const OrderUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderItemCreateInputSchema: z.ZodType<Prisma.OrderItemCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutItemsInputSchema),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutOrderItemsInputSchema).optional(),
});

export const OrderItemUncheckedCreateInputSchema: z.ZodType<Prisma.OrderItemUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  productVariantId: z.string().optional().nullable(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export const OrderItemUpdateInputSchema: z.ZodType<Prisma.OrderItemUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneWithoutOrderItemsNestedInputSchema).optional(),
});

export const OrderItemUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderItemCreateManyInputSchema: z.ZodType<Prisma.OrderItemCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  productVariantId: z.string().optional().nullable(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export const OrderItemUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderItemUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderItemUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PaymentCreateInputSchema: z.ZodType<Prisma.PaymentCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  order: z.lazy(() => OrderCreateNestedOneWithoutPaymentsInputSchema),
});

export const PaymentUncheckedCreateInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  method: z.lazy(() => PaymentMethodSchema),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const PaymentUpdateInputSchema: z.ZodType<Prisma.PaymentUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutPaymentsNestedInputSchema).optional(),
});

export const PaymentUncheckedUpdateInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PaymentCreateManyInputSchema: z.ZodType<Prisma.PaymentCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  method: z.lazy(() => PaymentMethodSchema),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const PaymentUpdateManyMutationInputSchema: z.ZodType<Prisma.PaymentUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PaymentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewCreateInputSchema: z.ZodType<Prisma.ReviewCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
});

export const ReviewUncheckedCreateInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  productId: z.string(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewUpdateInputSchema: z.ZodType<Prisma.ReviewUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewCreateManyInputSchema: z.ZodType<Prisma.ReviewCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  productId: z.string(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewUpdateManyMutationInputSchema: z.ZodType<Prisma.ReviewUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const EnumUserStatusFilterSchema: z.ZodType<Prisma.EnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
});

export const EnumUserRoleFilterSchema: z.ZodType<Prisma.EnumUserRoleFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const CartNullableScalarRelationFilterSchema: z.ZodType<Prisma.CartNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CartWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => CartWhereInputSchema).optional().nullable(),
});

export const OrderListRelationFilterSchema: z.ZodType<Prisma.OrderListRelationFilter> = z.strictObject({
  every: z.lazy(() => OrderWhereInputSchema).optional(),
  some: z.lazy(() => OrderWhereInputSchema).optional(),
  none: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const ReviewListRelationFilterSchema: z.ZodType<Prisma.ReviewListRelationFilter> = z.strictObject({
  every: z.lazy(() => ReviewWhereInputSchema).optional(),
  some: z.lazy(() => ReviewWhereInputSchema).optional(),
  none: z.lazy(() => ReviewWhereInputSchema).optional(),
});

export const ProductListRelationFilterSchema: z.ZodType<Prisma.ProductListRelationFilter> = z.strictObject({
  every: z.lazy(() => ProductWhereInputSchema).optional(),
  some: z.lazy(() => ProductWhereInputSchema).optional(),
  none: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const OrderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReviewOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  avatar: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  avatar: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  avatar: z.lazy(() => SortOrderSchema).optional(),
  gender: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const EnumUserStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
});

export const EnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
});

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const CategoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  icon: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  icon: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  icon: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumProductStatusFilterSchema: z.ZodType<Prisma.EnumProductStatusFilter> = z.strictObject({
  equals: z.lazy(() => ProductStatusSchema).optional(),
  in: z.lazy(() => ProductStatusSchema).array().optional(),
  notIn: z.lazy(() => ProductStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => NestedEnumProductStatusFilterSchema) ]).optional(),
});

export const CategoryScalarRelationFilterSchema: z.ZodType<Prisma.CategoryScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CategoryWhereInputSchema).optional(),
  isNot: z.lazy(() => CategoryWhereInputSchema).optional(),
});

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional(),
});

export const ProductColorListRelationFilterSchema: z.ZodType<Prisma.ProductColorListRelationFilter> = z.strictObject({
  every: z.lazy(() => ProductColorWhereInputSchema).optional(),
  some: z.lazy(() => ProductColorWhereInputSchema).optional(),
  none: z.lazy(() => ProductColorWhereInputSchema).optional(),
});

export const ProductColorOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductColorOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  sellerId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  sellerId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  sellerId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumProductStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumProductStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ProductStatusSchema).optional(),
  in: z.lazy(() => ProductStatusSchema).array().optional(),
  notIn: z.lazy(() => ProductStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => NestedEnumProductStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
});

export const ProductScalarRelationFilterSchema: z.ZodType<Prisma.ProductScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductVariantListRelationFilterSchema: z.ZodType<Prisma.ProductVariantListRelationFilter> = z.strictObject({
  every: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  some: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  none: z.lazy(() => ProductVariantWhereInputSchema).optional(),
});

export const ProductVariantOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductVariantOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductColorProductIdColorCompoundUniqueInputSchema: z.ZodType<Prisma.ProductColorProductIdColorCompoundUniqueInput> = z.strictObject({
  productId: z.string(),
  color: z.string(),
});

export const ProductColorCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductColorCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductColorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductColorMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductColorMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductColorMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const DecimalFilterSchema: z.ZodType<Prisma.DecimalFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
});

export const DecimalNullableFilterSchema: z.ZodType<Prisma.DecimalNullableFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableFilterSchema) ]).optional().nullable(),
});

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const ProductColorScalarRelationFilterSchema: z.ZodType<Prisma.ProductColorScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductColorWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductColorWhereInputSchema).optional(),
});

export const CartItemListRelationFilterSchema: z.ZodType<Prisma.CartItemListRelationFilter> = z.strictObject({
  every: z.lazy(() => CartItemWhereInputSchema).optional(),
  some: z.lazy(() => CartItemWhereInputSchema).optional(),
  none: z.lazy(() => CartItemWhereInputSchema).optional(),
});

export const OrderItemListRelationFilterSchema: z.ZodType<Prisma.OrderItemListRelationFilter> = z.strictObject({
  every: z.lazy(() => OrderItemWhereInputSchema).optional(),
  some: z.lazy(() => OrderItemWhereInputSchema).optional(),
  none: z.lazy(() => OrderItemWhereInputSchema).optional(),
});

export const CartItemOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CartItemOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderItemOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderItemOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  storage: z.lazy(() => SortOrderSchema).optional(),
  sku: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantAvgOrderByAggregateInput> = z.strictObject({
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  storage: z.lazy(() => SortOrderSchema).optional(),
  sku: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  storage: z.lazy(() => SortOrderSchema).optional(),
  sku: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantSumOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantSumOrderByAggregateInput> = z.strictObject({
  price: z.lazy(() => SortOrderSchema).optional(),
  salePrice: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
});

export const DecimalWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
});

export const DecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalNullableWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
});

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const CartCountOrderByAggregateInputSchema: z.ZodType<Prisma.CartCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CartMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartMinOrderByAggregateInputSchema: z.ZodType<Prisma.CartMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartScalarRelationFilterSchema: z.ZodType<Prisma.CartScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CartWhereInputSchema).optional(),
  isNot: z.lazy(() => CartWhereInputSchema).optional(),
});

export const ProductVariantScalarRelationFilterSchema: z.ZodType<Prisma.ProductVariantScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductVariantWhereInputSchema).optional(),
});

export const CartItemCartIdProductVariantIdCompoundUniqueInputSchema: z.ZodType<Prisma.CartItemCartIdProductVariantIdCompoundUniqueInput> = z.strictObject({
  cartId: z.string(),
  productVariantId: z.string(),
});

export const CartItemCountOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemAvgOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemMinOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemSumOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemSumOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumOrderStatusFilterSchema: z.ZodType<Prisma.EnumOrderStatusFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional(),
  in: z.lazy(() => OrderStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusFilterSchema) ]).optional(),
});

export const PaymentListRelationFilterSchema: z.ZodType<Prisma.PaymentListRelationFilter> = z.strictObject({
  every: z.lazy(() => PaymentWhereInputSchema).optional(),
  some: z.lazy(() => PaymentWhereInputSchema).optional(),
  none: z.lazy(() => PaymentWhereInputSchema).optional(),
});

export const PaymentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PaymentOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  orderDate: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderAvgOrderByAggregateInput> = z.strictObject({
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  orderDate: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  orderDate: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderSumOrderByAggregateInputSchema: z.ZodType<Prisma.OrderSumOrderByAggregateInput> = z.strictObject({
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumOrderStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumOrderStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional(),
  in: z.lazy(() => OrderStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusFilterSchema).optional(),
});

export const OrderScalarRelationFilterSchema: z.ZodType<Prisma.OrderScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => OrderWhereInputSchema).optional(),
  isNot: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const ProductVariantNullableScalarRelationFilterSchema: z.ZodType<Prisma.ProductVariantNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductVariantWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ProductVariantWhereInputSchema).optional().nullable(),
});

export const OrderItemCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderItemCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderItemAvgOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderItemMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderItemMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderItemMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderItemMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderItemSumOrderByAggregateInputSchema: z.ZodType<Prisma.OrderItemSumOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumPaymentMethodFilterSchema: z.ZodType<Prisma.EnumPaymentMethodFilter> = z.strictObject({
  equals: z.lazy(() => PaymentMethodSchema).optional(),
  in: z.lazy(() => PaymentMethodSchema).array().optional(),
  notIn: z.lazy(() => PaymentMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => NestedEnumPaymentMethodFilterSchema) ]).optional(),
});

export const EnumPaymentStatusFilterSchema: z.ZodType<Prisma.EnumPaymentStatusFilter> = z.strictObject({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.lazy(() => PaymentStatusSchema).array().optional(),
  notIn: z.lazy(() => PaymentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => NestedEnumPaymentStatusFilterSchema) ]).optional(),
});

export const PaymentCountOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentAvgOrderByAggregateInput> = z.strictObject({
  amount: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentMinOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  transactionId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentSumOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentSumOrderByAggregateInput> = z.strictObject({
  amount: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumPaymentMethodWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPaymentMethodWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => PaymentMethodSchema).optional(),
  in: z.lazy(() => PaymentMethodSchema).array().optional(),
  notIn: z.lazy(() => PaymentMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => NestedEnumPaymentMethodWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPaymentMethodFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPaymentMethodFilterSchema).optional(),
});

export const EnumPaymentStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPaymentStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.lazy(() => PaymentStatusSchema).array().optional(),
  notIn: z.lazy(() => PaymentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => NestedEnumPaymentStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional(),
});

export const ReviewUserIdProductIdCompoundUniqueInputSchema: z.ZodType<Prisma.ReviewUserIdProductIdCompoundUniqueInput> = z.strictObject({
  userId: z.string(),
  productId: z.string(),
});

export const ReviewCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  star: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewAvgOrderByAggregateInput> = z.strictObject({
  star: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  star: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  star: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewSumOrderByAggregateInput> = z.strictObject({
  star: z.lazy(() => SortOrderSchema).optional(),
});

export const CartCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.CartCreateNestedOneWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
});

export const OrderCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderCreateWithoutUserInputSchema).array(), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema), z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
});

export const ReviewCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewCreateWithoutUserInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductCreateNestedManyWithoutSellerInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutSellerInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutSellerInputSchema), z.lazy(() => ProductCreateWithoutSellerInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema), z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManySellerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const CartUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.CartUncheckedCreateNestedOneWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
});

export const OrderUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderCreateWithoutUserInputSchema).array(), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema), z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
});

export const ReviewUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewCreateWithoutUserInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductUncheckedCreateNestedManyWithoutSellerInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutSellerInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutSellerInputSchema), z.lazy(() => ProductCreateWithoutSellerInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema), z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManySellerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional().nullable(),
});

export const EnumUserStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => UserStatusSchema).optional(),
});

export const EnumUserRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserRoleFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => UserRoleSchema).optional(),
});

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional(),
});

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional().nullable(),
});

export const CartUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.CartUpdateOneWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => CartUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CartWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CartWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CartUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => CartUpdateWithoutUserInputSchema), z.lazy(() => CartUncheckedUpdateWithoutUserInputSchema) ]).optional(),
});

export const OrderUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.OrderUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderCreateWithoutUserInputSchema).array(), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema), z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema), z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
});

export const ReviewUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewCreateWithoutUserInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReviewUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReviewUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => ReviewUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
});

export const ProductUpdateManyWithoutSellerNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutSellerNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutSellerInputSchema), z.lazy(() => ProductCreateWithoutSellerInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema), z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutSellerInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutSellerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManySellerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutSellerInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutSellerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutSellerInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutSellerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const CartUncheckedUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.CartUncheckedUpdateOneWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => CartUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CartWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CartWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CartUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => CartUpdateWithoutUserInputSchema), z.lazy(() => CartUncheckedUpdateWithoutUserInputSchema) ]).optional(),
});

export const OrderUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderCreateWithoutUserInputSchema).array(), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema), z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema), z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema), z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
});

export const ReviewUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewCreateWithoutUserInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReviewUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => ReviewUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => ReviewUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
});

export const ProductUncheckedUpdateManyWithoutSellerNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutSellerNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutSellerInputSchema), z.lazy(() => ProductCreateWithoutSellerInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema), z.lazy(() => ProductCreateOrConnectWithoutSellerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutSellerInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutSellerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManySellerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutSellerInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutSellerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutSellerInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutSellerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const ProductCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutCategoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoryInputSchema), z.lazy(() => ProductCreateWithoutCategoryInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductUncheckedCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutCategoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoryInputSchema), z.lazy(() => ProductCreateWithoutCategoryInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutCategoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoryInputSchema), z.lazy(() => ProductCreateWithoutCategoryInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const ProductUncheckedUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutCategoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoryInputSchema), z.lazy(() => ProductCreateWithoutCategoryInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => ProductCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const CategoryCreateNestedOneWithoutProductsInputSchema: z.ZodType<Prisma.CategoryCreateNestedOneWithoutProductsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoryCreateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutProductsInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
});

export const UserCreateNestedOneWithoutProductsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutProductsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutProductsInputSchema), z.lazy(() => UserUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutProductsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const ProductColorCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ProductColorCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductColorCreateWithoutProductInputSchema), z.lazy(() => ProductColorCreateWithoutProductInputSchema).array(), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema), z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductColorCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
});

export const ReviewCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema), z.lazy(() => ReviewCreateWithoutProductInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductColorUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductColorCreateWithoutProductInputSchema), z.lazy(() => ProductColorCreateWithoutProductInputSchema).array(), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema), z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductColorCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
});

export const ReviewUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema), z.lazy(() => ReviewCreateWithoutProductInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
});

export const EnumProductStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumProductStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => ProductStatusSchema).optional(),
});

export const CategoryUpdateOneRequiredWithoutProductsNestedInputSchema: z.ZodType<Prisma.CategoryUpdateOneRequiredWithoutProductsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoryCreateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutProductsInputSchema).optional(),
  upsert: z.lazy(() => CategoryUpsertWithoutProductsInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CategoryUpdateToOneWithWhereWithoutProductsInputSchema), z.lazy(() => CategoryUpdateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutProductsInputSchema) ]).optional(),
});

export const UserUpdateOneRequiredWithoutProductsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutProductsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutProductsInputSchema), z.lazy(() => UserUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutProductsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutProductsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutProductsInputSchema), z.lazy(() => UserUpdateWithoutProductsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutProductsInputSchema) ]).optional(),
});

export const ProductColorUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ProductColorUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductColorCreateWithoutProductInputSchema), z.lazy(() => ProductColorCreateWithoutProductInputSchema).array(), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema), z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductColorUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ProductColorUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductColorCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductColorUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ProductColorUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductColorUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => ProductColorUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductColorScalarWhereInputSchema), z.lazy(() => ProductColorScalarWhereInputSchema).array() ]).optional(),
});

export const ReviewUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema), z.lazy(() => ReviewCreateWithoutProductInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
});

export const ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductColorCreateWithoutProductInputSchema), z.lazy(() => ProductColorCreateWithoutProductInputSchema).array(), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema), z.lazy(() => ProductColorCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductColorUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ProductColorUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductColorCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductColorWhereUniqueInputSchema), z.lazy(() => ProductColorWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductColorUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ProductColorUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductColorUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => ProductColorUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductColorScalarWhereInputSchema), z.lazy(() => ProductColorScalarWhereInputSchema).array() ]).optional(),
});

export const ReviewUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema), z.lazy(() => ReviewCreateWithoutProductInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
});

export const ProductCreateNestedOneWithoutColorsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutColorsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutColorsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutColorsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});

export const ProductVariantCreateNestedManyWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantCreateNestedManyWithoutProductColorInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema).array(), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductVariantCreateManyProductColorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductVariantUncheckedCreateNestedManyWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateNestedManyWithoutProductColorInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema).array(), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductVariantCreateManyProductColorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
});

export const ProductUpdateOneRequiredWithoutColorsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutColorsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutColorsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutColorsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutColorsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutColorsInputSchema), z.lazy(() => ProductUpdateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutColorsInputSchema) ]).optional(),
});

export const ProductVariantUpdateManyWithoutProductColorNestedInputSchema: z.ZodType<Prisma.ProductVariantUpdateManyWithoutProductColorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema).array(), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductVariantUpsertWithWhereUniqueWithoutProductColorInputSchema), z.lazy(() => ProductVariantUpsertWithWhereUniqueWithoutProductColorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductVariantCreateManyProductColorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductVariantUpdateWithWhereUniqueWithoutProductColorInputSchema), z.lazy(() => ProductVariantUpdateWithWhereUniqueWithoutProductColorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductVariantUpdateManyWithWhereWithoutProductColorInputSchema), z.lazy(() => ProductVariantUpdateManyWithWhereWithoutProductColorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductVariantScalarWhereInputSchema), z.lazy(() => ProductVariantScalarWhereInputSchema).array() ]).optional(),
});

export const ProductVariantUncheckedUpdateManyWithoutProductColorNestedInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateManyWithoutProductColorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema).array(), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema), z.lazy(() => ProductVariantCreateOrConnectWithoutProductColorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductVariantUpsertWithWhereUniqueWithoutProductColorInputSchema), z.lazy(() => ProductVariantUpsertWithWhereUniqueWithoutProductColorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductVariantCreateManyProductColorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductVariantWhereUniqueInputSchema), z.lazy(() => ProductVariantWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductVariantUpdateWithWhereUniqueWithoutProductColorInputSchema), z.lazy(() => ProductVariantUpdateWithWhereUniqueWithoutProductColorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductVariantUpdateManyWithWhereWithoutProductColorInputSchema), z.lazy(() => ProductVariantUpdateManyWithWhereWithoutProductColorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductVariantScalarWhereInputSchema), z.lazy(() => ProductVariantScalarWhereInputSchema).array() ]).optional(),
});

export const ProductColorCreateNestedOneWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorCreateNestedOneWithoutVariantsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductColorCreateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductColorCreateOrConnectWithoutVariantsInputSchema).optional(),
  connect: z.lazy(() => ProductColorWhereUniqueInputSchema).optional(),
});

export const CartItemCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderItemCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
});

export const CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderItemUncheckedCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUncheckedCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
});

export const DecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DecimalFieldUpdateOperationsInput> = z.strictObject({
  set: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  increment: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
});

export const NullableDecimalFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDecimalFieldUpdateOperationsInput> = z.strictObject({
  set: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  increment: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  decrement: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  multiply: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  divide: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
});

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema: z.ZodType<Prisma.ProductColorUpdateOneRequiredWithoutVariantsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductColorCreateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductColorCreateOrConnectWithoutVariantsInputSchema).optional(),
  upsert: z.lazy(() => ProductColorUpsertWithoutVariantsInputSchema).optional(),
  connect: z.lazy(() => ProductColorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductColorUpdateToOneWithWhereWithoutVariantsInputSchema), z.lazy(() => ProductColorUpdateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedUpdateWithoutVariantsInputSchema) ]).optional(),
});

export const CartItemUpdateManyWithoutProductVariantNestedInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithoutProductVariantNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CartItemUpsertWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => CartItemUpsertWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CartItemUpdateWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => CartItemUpdateWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CartItemUpdateManyWithWhereWithoutProductVariantInputSchema), z.lazy(() => CartItemUpdateManyWithWhereWithoutProductVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CartItemScalarWhereInputSchema), z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
});

export const OrderItemUpdateManyWithoutProductVariantNestedInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithoutProductVariantNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderItemUpdateManyWithWhereWithoutProductVariantInputSchema), z.lazy(() => OrderItemUpdateManyWithWhereWithoutProductVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema), z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
});

export const CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyWithoutProductVariantNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CartItemUpsertWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => CartItemUpsertWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CartItemUpdateWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => CartItemUpdateWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CartItemUpdateManyWithWhereWithoutProductVariantInputSchema), z.lazy(() => CartItemUpdateManyWithWhereWithoutProductVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CartItemScalarWhereInputSchema), z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
});

export const OrderItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyWithoutProductVariantNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderItemUpdateManyWithWhereWithoutProductVariantInputSchema), z.lazy(() => OrderItemUpdateManyWithWhereWithoutProductVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema), z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
});

export const UserCreateNestedOneWithoutCartInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCartInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCartInputSchema), z.lazy(() => UserUncheckedCreateWithoutCartInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCartInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const CartItemCreateNestedManyWithoutCartInputSchema: z.ZodType<Prisma.CartItemCreateNestedManyWithoutCartInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema), z.lazy(() => CartItemCreateWithoutCartInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyCartInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
});

export const CartItemUncheckedCreateNestedManyWithoutCartInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateNestedManyWithoutCartInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema), z.lazy(() => CartItemCreateWithoutCartInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyCartInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
});

export const UserUpdateOneRequiredWithoutCartNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutCartNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutCartInputSchema), z.lazy(() => UserUncheckedCreateWithoutCartInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCartInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutCartInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutCartInputSchema), z.lazy(() => UserUpdateWithoutCartInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCartInputSchema) ]).optional(),
});

export const CartItemUpdateManyWithoutCartNestedInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithoutCartNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema), z.lazy(() => CartItemCreateWithoutCartInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CartItemUpsertWithWhereUniqueWithoutCartInputSchema), z.lazy(() => CartItemUpsertWithWhereUniqueWithoutCartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyCartInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CartItemUpdateWithWhereUniqueWithoutCartInputSchema), z.lazy(() => CartItemUpdateWithWhereUniqueWithoutCartInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CartItemUpdateManyWithWhereWithoutCartInputSchema), z.lazy(() => CartItemUpdateManyWithWhereWithoutCartInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CartItemScalarWhereInputSchema), z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
});

export const CartItemUncheckedUpdateManyWithoutCartNestedInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyWithoutCartNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema), z.lazy(() => CartItemCreateWithoutCartInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CartItemUpsertWithWhereUniqueWithoutCartInputSchema), z.lazy(() => CartItemUpsertWithWhereUniqueWithoutCartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyCartInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CartItemUpdateWithWhereUniqueWithoutCartInputSchema), z.lazy(() => CartItemUpdateWithWhereUniqueWithoutCartInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CartItemUpdateManyWithWhereWithoutCartInputSchema), z.lazy(() => CartItemUpdateManyWithWhereWithoutCartInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CartItemScalarWhereInputSchema), z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
});

export const CartCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateNestedOneWithoutItemsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
});

export const ProductVariantCreateNestedOneWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateNestedOneWithoutCartItemsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutCartItemsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
});

export const CartUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.CartUpdateOneRequiredWithoutItemsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutItemsInputSchema).optional(),
  upsert: z.lazy(() => CartUpsertWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CartUpdateToOneWithWhereWithoutItemsInputSchema), z.lazy(() => CartUpdateWithoutItemsInputSchema), z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema) ]).optional(),
});

export const ProductVariantUpdateOneRequiredWithoutCartItemsNestedInputSchema: z.ZodType<Prisma.ProductVariantUpdateOneRequiredWithoutCartItemsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutCartItemsInputSchema).optional(),
  upsert: z.lazy(() => ProductVariantUpsertWithoutCartItemsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductVariantUpdateToOneWithWhereWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUpdateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutCartItemsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutOrdersInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrdersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const OrderItemCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema), z.lazy(() => OrderItemCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
});

export const PaymentCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.PaymentCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentCreateWithoutOrderInputSchema).array(), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema), z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PaymentCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUncheckedCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema), z.lazy(() => OrderItemCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
});

export const PaymentUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentCreateWithoutOrderInputSchema).array(), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema), z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PaymentCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
});

export const EnumOrderStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumOrderStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => OrderStatusSchema).optional(),
});

export const UserUpdateOneRequiredWithoutOrdersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutOrdersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrdersInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutOrdersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutOrdersInputSchema), z.lazy(() => UserUpdateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutOrdersInputSchema) ]).optional(),
});

export const OrderItemUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema), z.lazy(() => OrderItemCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderItemUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => OrderItemUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema), z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
});

export const PaymentUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.PaymentUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentCreateWithoutOrderInputSchema).array(), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema), z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PaymentUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => PaymentUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PaymentCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PaymentUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => PaymentUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PaymentUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => PaymentUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PaymentScalarWhereInputSchema), z.lazy(() => PaymentScalarWhereInputSchema).array() ]).optional(),
});

export const OrderItemUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema), z.lazy(() => OrderItemCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema), z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderItemUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => OrderItemUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema), z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
});

export const PaymentUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentCreateWithoutOrderInputSchema).array(), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema), z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PaymentUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => PaymentUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PaymentCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PaymentWhereUniqueInputSchema), z.lazy(() => PaymentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PaymentUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => PaymentUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PaymentUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => PaymentUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PaymentScalarWhereInputSchema), z.lazy(() => PaymentScalarWhereInputSchema).array() ]).optional(),
});

export const OrderCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutItemsInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
});

export const ProductVariantCreateNestedOneWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateNestedOneWithoutOrderItemsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutOrderItemsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
});

export const OrderUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutItemsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutItemsInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutItemsInputSchema), z.lazy(() => OrderUpdateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]).optional(),
});

export const ProductVariantUpdateOneWithoutOrderItemsNestedInputSchema: z.ZodType<Prisma.ProductVariantUpdateOneWithoutOrderItemsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutOrderItemsInputSchema).optional(),
  upsert: z.lazy(() => ProductVariantUpsertWithoutOrderItemsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductVariantUpdateToOneWithWhereWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUpdateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutOrderItemsInputSchema) ]).optional(),
});

export const OrderCreateNestedOneWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutPaymentsInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutPaymentsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
});

export const EnumPaymentMethodFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentMethodFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => PaymentMethodSchema).optional(),
});

export const EnumPaymentStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => PaymentStatusSchema).optional(),
});

export const OrderUpdateOneRequiredWithoutPaymentsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutPaymentsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutPaymentsInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutPaymentsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutPaymentsInputSchema), z.lazy(() => OrderUpdateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutPaymentsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReviewsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const ProductCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutReviewsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});

export const UserUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutReviewsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutReviewsInputSchema), z.lazy(() => UserUpdateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
});

export const ProductUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutReviewsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutReviewsInputSchema), z.lazy(() => ProductUpdateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumUserStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
});

export const NestedEnumUserRoleFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
});

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumUserStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
});

export const NestedEnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
});

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const NestedEnumProductStatusFilterSchema: z.ZodType<Prisma.NestedEnumProductStatusFilter> = z.strictObject({
  equals: z.lazy(() => ProductStatusSchema).optional(),
  in: z.lazy(() => ProductStatusSchema).array().optional(),
  notIn: z.lazy(() => ProductStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => NestedEnumProductStatusFilterSchema) ]).optional(),
});

export const NestedEnumProductStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumProductStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => ProductStatusSchema).optional(),
  in: z.lazy(() => ProductStatusSchema).array().optional(),
  notIn: z.lazy(() => ProductStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => NestedEnumProductStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
});

export const NestedDecimalFilterSchema: z.ZodType<Prisma.NestedDecimalFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalFilterSchema) ]).optional(),
});

export const NestedDecimalNullableFilterSchema: z.ZodType<Prisma.NestedDecimalNullableFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableFilterSchema) ]).optional().nullable(),
});

export const NestedDecimalWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalFilterSchema).optional(),
});

export const NestedDecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDecimalNullableWithAggregatesFilter> = z.strictObject({
  equals: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  in: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  notIn: z.union([z.number().array(),z.string().array(),z.instanceof(Prisma.Decimal).array(),DecimalJsLikeSchema.array(),]).refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), { message: 'Must be a Decimal' }).optional().nullable(),
  lt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  lte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gt: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  gte: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  not: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
});

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const NestedEnumOrderStatusFilterSchema: z.ZodType<Prisma.NestedEnumOrderStatusFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional(),
  in: z.lazy(() => OrderStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusFilterSchema) ]).optional(),
});

export const NestedEnumOrderStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumOrderStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional(),
  in: z.lazy(() => OrderStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusFilterSchema).optional(),
});

export const NestedEnumPaymentMethodFilterSchema: z.ZodType<Prisma.NestedEnumPaymentMethodFilter> = z.strictObject({
  equals: z.lazy(() => PaymentMethodSchema).optional(),
  in: z.lazy(() => PaymentMethodSchema).array().optional(),
  notIn: z.lazy(() => PaymentMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => NestedEnumPaymentMethodFilterSchema) ]).optional(),
});

export const NestedEnumPaymentStatusFilterSchema: z.ZodType<Prisma.NestedEnumPaymentStatusFilter> = z.strictObject({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.lazy(() => PaymentStatusSchema).array().optional(),
  notIn: z.lazy(() => PaymentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => NestedEnumPaymentStatusFilterSchema) ]).optional(),
});

export const NestedEnumPaymentMethodWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPaymentMethodWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => PaymentMethodSchema).optional(),
  in: z.lazy(() => PaymentMethodSchema).array().optional(),
  notIn: z.lazy(() => PaymentMethodSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => NestedEnumPaymentMethodWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPaymentMethodFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPaymentMethodFilterSchema).optional(),
});

export const NestedEnumPaymentStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPaymentStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => PaymentStatusSchema).optional(),
  in: z.lazy(() => PaymentStatusSchema).array().optional(),
  notIn: z.lazy(() => PaymentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => NestedEnumPaymentStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPaymentStatusFilterSchema).optional(),
});

export const CartCreateWithoutUserInputSchema: z.ZodType<Prisma.CartCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  items: z.lazy(() => CartItemCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CartUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  items: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CartCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]),
});

export const OrderCreateWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => OrderItemCreateNestedManyWithoutOrderInputSchema).optional(),
  payments: z.lazy(() => PaymentCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  payments: z.lazy(() => PaymentUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema) ]),
});

export const OrderCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderCreateManyUserInputSchema), z.lazy(() => OrderCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ReviewCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
});

export const ReviewUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema) ]),
});

export const ReviewCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ReviewCreateManyUserInputSchema), z.lazy(() => ReviewCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ProductCreateWithoutSellerInputSchema: z.ZodType<Prisma.ProductCreateWithoutSellerInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutProductsInputSchema),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutSellerInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutSellerInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutSellerInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutSellerInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema) ]),
});

export const ProductCreateManySellerInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManySellerInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ProductCreateManySellerInputSchema), z.lazy(() => ProductCreateManySellerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CartUpsertWithoutUserInputSchema: z.ZodType<Prisma.CartUpsertWithoutUserInput> = z.strictObject({
  update: z.union([ z.lazy(() => CartUpdateWithoutUserInputSchema), z.lazy(() => CartUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => CartWhereInputSchema).optional(),
});

export const CartUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CartUpdateToOneWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CartWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CartUpdateWithoutUserInputSchema), z.lazy(() => CartUncheckedUpdateWithoutUserInputSchema) ]),
});

export const CartUpdateWithoutUserInputSchema: z.ZodType<Prisma.CartUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => CartItemUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const CartUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CartUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  items: z.lazy(() => CartItemUncheckedUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const OrderUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderUpdateWithoutUserInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema) ]),
});

export const OrderUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateWithoutUserInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutUserInputSchema) ]),
});

export const OrderUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => OrderScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateManyMutationInputSchema), z.lazy(() => OrderUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const OrderScalarWhereInputSchema: z.ZodType<Prisma.OrderScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderScalarWhereInputSchema), z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderScalarWhereInputSchema), z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderCode: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ReviewUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema) ]),
});

export const ReviewUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutUserInputSchema) ]),
});

export const ReviewUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema), z.lazy(() => ReviewUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const ReviewScalarWhereInputSchema: z.ZodType<Prisma.ReviewScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewScalarWhereInputSchema), z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  star: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductUpsertWithWhereUniqueWithoutSellerInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutSellerInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSellerInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedCreateWithoutSellerInputSchema) ]),
});

export const ProductUpdateWithWhereUniqueWithoutSellerInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutSellerInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutSellerInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutSellerInputSchema) ]),
});

export const ProductUpdateManyWithWhereWithoutSellerInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutSellerInput> = z.strictObject({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema), z.lazy(() => ProductUncheckedUpdateManyWithoutSellerInputSchema) ]),
});

export const ProductScalarWhereInputSchema: z.ZodType<Prisma.ProductScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  categoryId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sellerId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductCreateWithoutCategoryInputSchema: z.ZodType<Prisma.ProductCreateWithoutCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  seller: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  sellerId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema) ]),
});

export const ProductCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManyCategoryInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ProductCreateManyCategoryInputSchema), z.lazy(() => ProductCreateManyCategoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ProductUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutCategoryInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedCreateWithoutCategoryInputSchema) ]),
});

export const ProductUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutCategoryInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutCategoryInputSchema) ]),
});

export const ProductUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema), z.lazy(() => ProductUncheckedUpdateManyWithoutCategoryInputSchema) ]),
});

export const CategoryCreateWithoutProductsInputSchema: z.ZodType<Prisma.CategoryCreateWithoutProductsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CategoryUncheckedCreateWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutProductsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CategoryCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.CategoryCreateOrConnectWithoutProductsInput> = z.strictObject({
  where: z.lazy(() => CategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CategoryCreateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutProductsInputSchema) ]),
});

export const UserCreateWithoutProductsInputSchema: z.ZodType<Prisma.UserCreateWithoutProductsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateWithoutProductsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutProductsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutProductsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutProductsInputSchema), z.lazy(() => UserUncheckedCreateWithoutProductsInputSchema) ]),
});

export const ProductColorCreateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  variants: z.lazy(() => ProductVariantCreateNestedManyWithoutProductColorInputSchema).optional(),
});

export const ProductColorUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedCreateNestedManyWithoutProductColorInputSchema).optional(),
});

export const ProductColorCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.ProductColorCreateOrConnectWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ProductColorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductColorCreateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema) ]),
});

export const ProductColorCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.ProductColorCreateManyProductInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ProductColorCreateManyProductInputSchema), z.lazy(() => ProductColorCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ReviewCreateWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
});

export const ReviewUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema) ]),
});

export const ReviewCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyProductInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ReviewCreateManyProductInputSchema), z.lazy(() => ReviewCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CategoryUpsertWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUpsertWithoutProductsInput> = z.strictObject({
  update: z.union([ z.lazy(() => CategoryUpdateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => CategoryCreateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutProductsInputSchema) ]),
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
});

export const CategoryUpdateToOneWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUpdateToOneWithWhereWithoutProductsInput> = z.strictObject({
  where: z.lazy(() => CategoryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CategoryUpdateWithoutProductsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutProductsInputSchema) ]),
});

export const CategoryUpdateWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUpdateWithoutProductsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icon: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CategoryUncheckedUpdateWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateWithoutProductsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icon: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const UserUpsertWithoutProductsInputSchema: z.ZodType<Prisma.UserUpsertWithoutProductsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutProductsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutProductsInputSchema), z.lazy(() => UserUncheckedCreateWithoutProductsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutProductsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutProductsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutProductsInputSchema) ]),
});

export const UserUpdateWithoutProductsInputSchema: z.ZodType<Prisma.UserUpdateWithoutProductsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutProductsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutProductsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const ProductColorUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUpsertWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ProductColorWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductColorUpdateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => ProductColorCreateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutProductInputSchema) ]),
});

export const ProductColorUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUpdateWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ProductColorWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductColorUpdateWithoutProductInputSchema), z.lazy(() => ProductColorUncheckedUpdateWithoutProductInputSchema) ]),
});

export const ProductColorUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUpdateManyWithWhereWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ProductColorScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductColorUpdateManyMutationInputSchema), z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductInputSchema) ]),
});

export const ProductColorScalarWhereInputSchema: z.ZodType<Prisma.ProductColorScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductColorScalarWhereInputSchema), z.lazy(() => ProductColorScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductColorScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductColorScalarWhereInputSchema), z.lazy(() => ProductColorScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ReviewUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema) ]),
});

export const ReviewUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutProductInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutProductInputSchema) ]),
});

export const ReviewUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutProductInput> = z.strictObject({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema), z.lazy(() => ReviewUncheckedUpdateManyWithoutProductInputSchema) ]),
});

export const ProductCreateWithoutColorsInputSchema: z.ZodType<Prisma.ProductCreateWithoutColorsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutProductsInputSchema),
  seller: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutColorsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutColorsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  sellerId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutColorsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutColorsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutColorsInputSchema) ]),
});

export const ProductVariantCreateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantCreateWithoutProductColorInput> = z.strictObject({
  id: z.uuid().optional(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateWithoutProductColorInput> = z.strictObject({
  id: z.uuid().optional(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantCreateOrConnectWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantCreateOrConnectWithoutProductColorInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema) ]),
});

export const ProductVariantCreateManyProductColorInputEnvelopeSchema: z.ZodType<Prisma.ProductVariantCreateManyProductColorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ProductVariantCreateManyProductColorInputSchema), z.lazy(() => ProductVariantCreateManyProductColorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ProductUpsertWithoutColorsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutColorsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductUpdateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutColorsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutColorsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductUpdateToOneWithWhereWithoutColorsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutColorsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutColorsInputSchema) ]),
});

export const ProductUpdateWithoutColorsInputSchema: z.ZodType<Prisma.ProductUpdateWithoutColorsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  seller: z.lazy(() => UserUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutColorsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutColorsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sellerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductVariantUpsertWithWhereUniqueWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUpsertWithWhereUniqueWithoutProductColorInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductVariantUpdateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutProductColorInputSchema) ]),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutProductColorInputSchema) ]),
});

export const ProductVariantUpdateWithWhereUniqueWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUpdateWithWhereUniqueWithoutProductColorInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductVariantUpdateWithoutProductColorInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutProductColorInputSchema) ]),
});

export const ProductVariantUpdateManyWithWhereWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUpdateManyWithWhereWithoutProductColorInput> = z.strictObject({
  where: z.lazy(() => ProductVariantScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductVariantUpdateManyMutationInputSchema), z.lazy(() => ProductVariantUncheckedUpdateManyWithoutProductColorInputSchema) ]),
});

export const ProductVariantScalarWhereInputSchema: z.ZodType<Prisma.ProductVariantScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductVariantScalarWhereInputSchema), z.lazy(() => ProductVariantScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductVariantScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductVariantScalarWhereInputSchema), z.lazy(() => ProductVariantScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productColorId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  storage: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  sku: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  salePrice: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  stock: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductColorCreateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorCreateWithoutVariantsInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  product: z.lazy(() => ProductCreateNestedOneWithoutColorsInputSchema),
});

export const ProductColorUncheckedCreateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUncheckedCreateWithoutVariantsInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductColorCreateOrConnectWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorCreateOrConnectWithoutVariantsInput> = z.strictObject({
  where: z.lazy(() => ProductColorWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductColorCreateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutVariantsInputSchema) ]),
});

export const CartItemCreateWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemCreateWithoutProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutItemsInputSchema),
});

export const CartItemUncheckedCreateWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateWithoutProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  cartId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartItemCreateOrConnectWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemCreateOrConnectWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema) ]),
});

export const CartItemCreateManyProductVariantInputEnvelopeSchema: z.ZodType<Prisma.CartItemCreateManyProductVariantInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CartItemCreateManyProductVariantInputSchema), z.lazy(() => CartItemCreateManyProductVariantInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const OrderItemCreateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemCreateWithoutProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutItemsInputSchema),
});

export const OrderItemUncheckedCreateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUncheckedCreateWithoutProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export const OrderItemCreateOrConnectWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemCreateOrConnectWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema) ]),
});

export const OrderItemCreateManyProductVariantInputEnvelopeSchema: z.ZodType<Prisma.OrderItemCreateManyProductVariantInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderItemCreateManyProductVariantInputSchema), z.lazy(() => OrderItemCreateManyProductVariantInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ProductColorUpsertWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUpsertWithoutVariantsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductColorUpdateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedUpdateWithoutVariantsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductColorCreateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedCreateWithoutVariantsInputSchema) ]),
  where: z.lazy(() => ProductColorWhereInputSchema).optional(),
});

export const ProductColorUpdateToOneWithWhereWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUpdateToOneWithWhereWithoutVariantsInput> = z.strictObject({
  where: z.lazy(() => ProductColorWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductColorUpdateWithoutVariantsInputSchema), z.lazy(() => ProductColorUncheckedUpdateWithoutVariantsInputSchema) ]),
});

export const ProductColorUpdateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUpdateWithoutVariantsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutColorsNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateWithoutVariantsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CartItemUpsertWithWhereUniqueWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUpsertWithWhereUniqueWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CartItemUpdateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedUpdateWithoutProductVariantInputSchema) ]),
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema) ]),
});

export const CartItemUpdateWithWhereUniqueWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUpdateWithWhereUniqueWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedUpdateWithoutProductVariantInputSchema) ]),
});

export const CartItemUpdateManyWithWhereWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithWhereWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => CartItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateManyMutationInputSchema), z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantInputSchema) ]),
});

export const CartItemScalarWhereInputSchema: z.ZodType<Prisma.CartItemScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartItemScalarWhereInputSchema), z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartItemScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartItemScalarWhereInputSchema), z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const OrderItemUpsertWithWhereUniqueWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUpsertWithWhereUniqueWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderItemUpdateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedUpdateWithoutProductVariantInputSchema) ]),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutProductVariantInputSchema) ]),
});

export const OrderItemUpdateWithWhereUniqueWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUpdateWithWhereUniqueWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateWithoutProductVariantInputSchema), z.lazy(() => OrderItemUncheckedUpdateWithoutProductVariantInputSchema) ]),
});

export const OrderItemUpdateManyWithWhereWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithWhereWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateManyMutationInputSchema), z.lazy(() => OrderItemUncheckedUpdateManyWithoutProductVariantInputSchema) ]),
});

export const OrderItemScalarWhereInputSchema: z.ZodType<Prisma.OrderItemScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema), z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderItemScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema), z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateWithoutCartInputSchema: z.ZodType<Prisma.UserCreateWithoutCartInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserUncheckedCreateWithoutCartInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCartInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserCreateOrConnectWithoutCartInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCartInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutCartInputSchema), z.lazy(() => UserUncheckedCreateWithoutCartInputSchema) ]),
});

export const CartItemCreateWithoutCartInputSchema: z.ZodType<Prisma.CartItemCreateWithoutCartInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutCartItemsInputSchema),
});

export const CartItemUncheckedCreateWithoutCartInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateWithoutCartInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartItemCreateOrConnectWithoutCartInputSchema: z.ZodType<Prisma.CartItemCreateOrConnectWithoutCartInput> = z.strictObject({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema) ]),
});

export const CartItemCreateManyCartInputEnvelopeSchema: z.ZodType<Prisma.CartItemCreateManyCartInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CartItemCreateManyCartInputSchema), z.lazy(() => CartItemCreateManyCartInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const UserUpsertWithoutCartInputSchema: z.ZodType<Prisma.UserUpsertWithoutCartInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutCartInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCartInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutCartInputSchema), z.lazy(() => UserUncheckedCreateWithoutCartInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutCartInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCartInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCartInputSchema), z.lazy(() => UserUncheckedUpdateWithoutCartInputSchema) ]),
});

export const UserUpdateWithoutCartInputSchema: z.ZodType<Prisma.UserUpdateWithoutCartInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutCartInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCartInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const CartItemUpsertWithWhereUniqueWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpsertWithWhereUniqueWithoutCartInput> = z.strictObject({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CartItemUpdateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedUpdateWithoutCartInputSchema) ]),
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema) ]),
});

export const CartItemUpdateWithWhereUniqueWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpdateWithWhereUniqueWithoutCartInput> = z.strictObject({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateWithoutCartInputSchema), z.lazy(() => CartItemUncheckedUpdateWithoutCartInputSchema) ]),
});

export const CartItemUpdateManyWithWhereWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithWhereWithoutCartInput> = z.strictObject({
  where: z.lazy(() => CartItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateManyMutationInputSchema), z.lazy(() => CartItemUncheckedUpdateManyWithoutCartInputSchema) ]),
});

export const CartCreateWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateWithoutItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutCartInputSchema),
});

export const CartUncheckedCreateWithoutItemsInputSchema: z.ZodType<Prisma.CartUncheckedCreateWithoutItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateOrConnectWithoutItemsInput> = z.strictObject({
  where: z.lazy(() => CartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]),
});

export const ProductVariantCreateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateWithoutCartItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  productColor: z.lazy(() => ProductColorCreateNestedOneWithoutVariantsInputSchema),
  orderItems: z.lazy(() => OrderItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateWithoutCartItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  orderItems: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantCreateOrConnectWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateOrConnectWithoutCartItemsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]),
});

export const CartUpsertWithoutItemsInputSchema: z.ZodType<Prisma.CartUpsertWithoutItemsInput> = z.strictObject({
  update: z.union([ z.lazy(() => CartUpdateWithoutItemsInputSchema), z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema) ]),
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]),
  where: z.lazy(() => CartWhereInputSchema).optional(),
});

export const CartUpdateToOneWithWhereWithoutItemsInputSchema: z.ZodType<Prisma.CartUpdateToOneWithWhereWithoutItemsInput> = z.strictObject({
  where: z.lazy(() => CartWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CartUpdateWithoutItemsInputSchema), z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema) ]),
});

export const CartUpdateWithoutItemsInputSchema: z.ZodType<Prisma.CartUpdateWithoutItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCartNestedInputSchema).optional(),
});

export const CartUncheckedUpdateWithoutItemsInputSchema: z.ZodType<Prisma.CartUncheckedUpdateWithoutItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const ProductVariantUpsertWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUpsertWithoutCartItemsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductVariantUpdateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutCartItemsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]),
  where: z.lazy(() => ProductVariantWhereInputSchema).optional(),
});

export const ProductVariantUpdateToOneWithWhereWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUpdateToOneWithWhereWithoutCartItemsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductVariantUpdateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutCartItemsInputSchema) ]),
});

export const ProductVariantUpdateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUpdateWithoutCartItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productColor: z.lazy(() => ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateWithoutCartItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderItems: z.lazy(() => OrderItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const UserCreateWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateWithoutOrdersInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserUncheckedCreateWithoutOrdersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutOrdersInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserCreateOrConnectWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutOrdersInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema) ]),
});

export const OrderItemCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutOrderItemsInputSchema).optional(),
});

export const OrderItemUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUncheckedCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string().optional().nullable(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export const OrderItemCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemCreateOrConnectWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema) ]),
});

export const OrderItemCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.OrderItemCreateManyOrderInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderItemCreateManyOrderInputSchema), z.lazy(() => OrderItemCreateManyOrderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PaymentCreateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const PaymentUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const PaymentCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.PaymentCreateOrConnectWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => PaymentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]),
});

export const PaymentCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.PaymentCreateManyOrderInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => PaymentCreateManyOrderInputSchema), z.lazy(() => PaymentCreateManyOrderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const UserUpsertWithoutOrdersInputSchema: z.ZodType<Prisma.UserUpsertWithoutOrdersInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutOrdersInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutOrdersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutOrdersInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutOrdersInputSchema) ]),
});

export const UserUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.UserUpdateWithoutOrdersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutOrdersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpsertWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderItemUpdateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema) ]),
});

export const OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpdateWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateWithoutOrderInputSchema), z.lazy(() => OrderItemUncheckedUpdateWithoutOrderInputSchema) ]),
});

export const OrderItemUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithWhereWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateManyMutationInputSchema), z.lazy(() => OrderItemUncheckedUpdateManyWithoutOrderInputSchema) ]),
});

export const PaymentUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpsertWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => PaymentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PaymentUpdateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]),
});

export const PaymentUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpdateWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => PaymentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PaymentUpdateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedUpdateWithoutOrderInputSchema) ]),
});

export const PaymentUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpdateManyWithWhereWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => PaymentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PaymentUpdateManyMutationInputSchema), z.lazy(() => PaymentUncheckedUpdateManyWithoutOrderInputSchema) ]),
});

export const PaymentScalarWhereInputSchema: z.ZodType<Prisma.PaymentScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PaymentScalarWhereInputSchema), z.lazy(() => PaymentScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PaymentScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PaymentScalarWhereInputSchema), z.lazy(() => PaymentScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  transactionId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const OrderCreateWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateWithoutItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  payments: z.lazy(() => PaymentCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutItemsInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  payments: z.lazy(() => PaymentUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutItemsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]),
});

export const ProductVariantCreateWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateWithoutOrderItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  productColor: z.lazy(() => ProductColorCreateNestedOneWithoutVariantsInputSchema),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateWithoutOrderItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantCreateOrConnectWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateOrConnectWithoutOrderItemsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderItemsInputSchema) ]),
});

export const OrderUpsertWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutItemsInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderUpdateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const OrderUpdateToOneWithWhereWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutItemsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutItemsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]),
});

export const OrderUpdateWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpdateWithoutItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  payments: z.lazy(() => PaymentUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutItemsInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payments: z.lazy(() => PaymentUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const ProductVariantUpsertWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantUpsertWithoutOrderItemsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductVariantUpdateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutOrderItemsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderItemsInputSchema) ]),
  where: z.lazy(() => ProductVariantWhereInputSchema).optional(),
});

export const ProductVariantUpdateToOneWithWhereWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantUpdateToOneWithWhereWithoutOrderItemsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductVariantUpdateWithoutOrderItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutOrderItemsInputSchema) ]),
});

export const ProductVariantUpdateWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantUpdateWithoutOrderItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productColor: z.lazy(() => ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateWithoutOrderItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const OrderCreateWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderCreateWithoutPaymentsInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  items: z.lazy(() => OrderItemCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutPaymentsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutPaymentsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentsInputSchema) ]),
});

export const OrderUpsertWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutPaymentsInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderUpdateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutPaymentsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentsInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const OrderUpdateToOneWithWhereWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutPaymentsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutPaymentsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutPaymentsInputSchema) ]),
});

export const OrderUpdateWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderUpdateWithoutPaymentsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  items: z.lazy(() => OrderItemUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutPaymentsInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutPaymentsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  items: z.lazy(() => OrderItemUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const UserCreateWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserUncheckedCreateWithoutReviewsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  password: z.string(),
  avatar: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.lazy(() => UserStatusSchema).optional(),
  role: z.lazy(() => UserRoleSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutSellerInputSchema).optional(),
});

export const UserCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]),
});

export const ProductCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutProductsInputSchema),
  seller: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  sellerId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]),
});

export const UserUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.UserUpsertWithoutReviewsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutReviewsInputSchema) ]),
});

export const UserUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.UserUpdateWithoutReviewsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutReviewsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatar: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gender: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutSellerNestedInputSchema).optional(),
});

export const ProductUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutReviewsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductUpdateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]),
});

export const ProductUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpdateWithoutReviewsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  seller: z.lazy(() => UserUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutReviewsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sellerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const OrderCreateManyUserInputSchema: z.ZodType<Prisma.OrderCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.string(),
  orderDate: z.coerce.date().optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateManyUserInputSchema: z.ZodType<Prisma.ReviewCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductCreateManySellerInputSchema: z.ZodType<Prisma.ProductCreateManySellerInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const OrderUpdateWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  items: z.lazy(() => OrderItemUpdateManyWithoutOrderNestedInputSchema).optional(),
  payments: z.lazy(() => PaymentUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  items: z.lazy(() => OrderItemUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  payments: z.lazy(() => PaymentUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductUpdateWithoutSellerInputSchema: z.ZodType<Prisma.ProductUpdateWithoutSellerInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutSellerInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutSellerInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateManyWithoutSellerInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutSellerInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductCreateManyCategoryInputSchema: z.ZodType<Prisma.ProductCreateManyCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  sellerId: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUpdateWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  seller: z.lazy(() => UserUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sellerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateManyWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sellerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductColorCreateManyProductInputSchema: z.ZodType<Prisma.ProductColorCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateManyProductInputSchema: z.ZodType<Prisma.ReviewCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  description: z.string().optional().nullable(),
  star: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductColorUpdateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  variants: z.lazy(() => ProductVariantUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUpdateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  star: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductVariantCreateManyProductColorInputSchema: z.ZodType<Prisma.ProductVariantCreateManyProductColorInput> = z.strictObject({
  id: z.uuid().optional(),
  storage: z.string().optional().nullable(),
  sku: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  salePrice: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  stock: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductVariantUpdateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUpdateWithoutProductColorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateWithoutProductColorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateManyWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateManyWithoutProductColorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  storage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sku: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  salePrice: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CartItemCreateManyProductVariantInputSchema: z.ZodType<Prisma.CartItemCreateManyProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  cartId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const OrderItemCreateManyProductVariantInputSchema: z.ZodType<Prisma.OrderItemCreateManyProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export const CartItemUpdateWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUpdateWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cart: z.lazy(() => CartUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
});

export const CartItemUncheckedUpdateWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cartId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemUncheckedUpdateManyWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cartId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderItemUpdateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUpdateWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
});

export const OrderItemUncheckedUpdateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderItemUncheckedUpdateManyWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemCreateManyCartInputSchema: z.ZodType<Prisma.CartItemCreateManyCartInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartItemUpdateWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpdateWithoutCartInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneRequiredWithoutCartItemsNestedInputSchema).optional(),
});

export const CartItemUncheckedUpdateWithoutCartInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateWithoutCartInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemUncheckedUpdateManyWithoutCartInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyWithoutCartInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderItemCreateManyOrderInputSchema: z.ZodType<Prisma.OrderItemCreateManyOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string().optional().nullable(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export const PaymentCreateManyOrderInputSchema: z.ZodType<Prisma.PaymentCreateManyOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  transactionId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const OrderItemUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneWithoutOrderItemsNestedInputSchema).optional(),
});

export const OrderItemUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderItemUncheckedUpdateManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PaymentUpdateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PaymentUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PaymentUncheckedUpdateManyWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  transactionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(), 
  having: UserScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const CategoryFindFirstArgsSchema: z.ZodType<Prisma.CategoryFindFirstArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoryScalarFieldEnumSchema, CategoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CategoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CategoryFindFirstOrThrowArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoryScalarFieldEnumSchema, CategoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CategoryFindManyArgsSchema: z.ZodType<Prisma.CategoryFindManyArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoryScalarFieldEnumSchema, CategoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CategoryAggregateArgsSchema: z.ZodType<Prisma.CategoryAggregateArgs> = z.object({
  where: CategoryWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CategoryGroupByArgsSchema: z.ZodType<Prisma.CategoryGroupByArgs> = z.object({
  where: CategoryWhereInputSchema.optional(), 
  orderBy: z.union([ CategoryOrderByWithAggregationInputSchema.array(), CategoryOrderByWithAggregationInputSchema ]).optional(),
  by: CategoryScalarFieldEnumSchema.array(), 
  having: CategoryScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CategoryFindUniqueArgsSchema: z.ZodType<Prisma.CategoryFindUniqueArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereUniqueInputSchema, 
}).strict();

export const CategoryFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CategoryFindUniqueOrThrowArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereUniqueInputSchema, 
}).strict();

export const ProductFindFirstArgsSchema: z.ZodType<Prisma.ProductFindFirstArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductFindFirstOrThrowArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductFindManyArgsSchema: z.ZodType<Prisma.ProductFindManyArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductAggregateArgsSchema: z.ZodType<Prisma.ProductAggregateArgs> = z.object({
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductGroupByArgsSchema: z.ZodType<Prisma.ProductGroupByArgs> = z.object({
  where: ProductWhereInputSchema.optional(), 
  orderBy: z.union([ ProductOrderByWithAggregationInputSchema.array(), ProductOrderByWithAggregationInputSchema ]).optional(),
  by: ProductScalarFieldEnumSchema.array(), 
  having: ProductScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductFindUniqueArgsSchema: z.ZodType<Prisma.ProductFindUniqueArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProductFindUniqueOrThrowArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductColorFindFirstArgsSchema: z.ZodType<Prisma.ProductColorFindFirstArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereInputSchema.optional(), 
  orderBy: z.union([ ProductColorOrderByWithRelationInputSchema.array(), ProductColorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductColorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductColorScalarFieldEnumSchema, ProductColorScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductColorFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductColorFindFirstOrThrowArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereInputSchema.optional(), 
  orderBy: z.union([ ProductColorOrderByWithRelationInputSchema.array(), ProductColorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductColorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductColorScalarFieldEnumSchema, ProductColorScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductColorFindManyArgsSchema: z.ZodType<Prisma.ProductColorFindManyArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereInputSchema.optional(), 
  orderBy: z.union([ ProductColorOrderByWithRelationInputSchema.array(), ProductColorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductColorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductColorScalarFieldEnumSchema, ProductColorScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductColorAggregateArgsSchema: z.ZodType<Prisma.ProductColorAggregateArgs> = z.object({
  where: ProductColorWhereInputSchema.optional(), 
  orderBy: z.union([ ProductColorOrderByWithRelationInputSchema.array(), ProductColorOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductColorWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductColorGroupByArgsSchema: z.ZodType<Prisma.ProductColorGroupByArgs> = z.object({
  where: ProductColorWhereInputSchema.optional(), 
  orderBy: z.union([ ProductColorOrderByWithAggregationInputSchema.array(), ProductColorOrderByWithAggregationInputSchema ]).optional(),
  by: ProductColorScalarFieldEnumSchema.array(), 
  having: ProductColorScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductColorFindUniqueArgsSchema: z.ZodType<Prisma.ProductColorFindUniqueArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereUniqueInputSchema, 
}).strict();

export const ProductColorFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProductColorFindUniqueOrThrowArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereUniqueInputSchema, 
}).strict();

export const ProductVariantFindFirstArgsSchema: z.ZodType<Prisma.ProductVariantFindFirstArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereInputSchema.optional(), 
  orderBy: z.union([ ProductVariantOrderByWithRelationInputSchema.array(), ProductVariantOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductVariantWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductVariantScalarFieldEnumSchema, ProductVariantScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductVariantFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductVariantFindFirstOrThrowArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereInputSchema.optional(), 
  orderBy: z.union([ ProductVariantOrderByWithRelationInputSchema.array(), ProductVariantOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductVariantWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductVariantScalarFieldEnumSchema, ProductVariantScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductVariantFindManyArgsSchema: z.ZodType<Prisma.ProductVariantFindManyArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereInputSchema.optional(), 
  orderBy: z.union([ ProductVariantOrderByWithRelationInputSchema.array(), ProductVariantOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductVariantWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductVariantScalarFieldEnumSchema, ProductVariantScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ProductVariantAggregateArgsSchema: z.ZodType<Prisma.ProductVariantAggregateArgs> = z.object({
  where: ProductVariantWhereInputSchema.optional(), 
  orderBy: z.union([ ProductVariantOrderByWithRelationInputSchema.array(), ProductVariantOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductVariantWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductVariantGroupByArgsSchema: z.ZodType<Prisma.ProductVariantGroupByArgs> = z.object({
  where: ProductVariantWhereInputSchema.optional(), 
  orderBy: z.union([ ProductVariantOrderByWithAggregationInputSchema.array(), ProductVariantOrderByWithAggregationInputSchema ]).optional(),
  by: ProductVariantScalarFieldEnumSchema.array(), 
  having: ProductVariantScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ProductVariantFindUniqueArgsSchema: z.ZodType<Prisma.ProductVariantFindUniqueArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereUniqueInputSchema, 
}).strict();

export const ProductVariantFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ProductVariantFindUniqueOrThrowArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereUniqueInputSchema, 
}).strict();

export const CartFindFirstArgsSchema: z.ZodType<Prisma.CartFindFirstArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereInputSchema.optional(), 
  orderBy: z.union([ CartOrderByWithRelationInputSchema.array(), CartOrderByWithRelationInputSchema ]).optional(),
  cursor: CartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CartScalarFieldEnumSchema, CartScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CartFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CartFindFirstOrThrowArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereInputSchema.optional(), 
  orderBy: z.union([ CartOrderByWithRelationInputSchema.array(), CartOrderByWithRelationInputSchema ]).optional(),
  cursor: CartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CartScalarFieldEnumSchema, CartScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CartFindManyArgsSchema: z.ZodType<Prisma.CartFindManyArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereInputSchema.optional(), 
  orderBy: z.union([ CartOrderByWithRelationInputSchema.array(), CartOrderByWithRelationInputSchema ]).optional(),
  cursor: CartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CartScalarFieldEnumSchema, CartScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CartAggregateArgsSchema: z.ZodType<Prisma.CartAggregateArgs> = z.object({
  where: CartWhereInputSchema.optional(), 
  orderBy: z.union([ CartOrderByWithRelationInputSchema.array(), CartOrderByWithRelationInputSchema ]).optional(),
  cursor: CartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CartGroupByArgsSchema: z.ZodType<Prisma.CartGroupByArgs> = z.object({
  where: CartWhereInputSchema.optional(), 
  orderBy: z.union([ CartOrderByWithAggregationInputSchema.array(), CartOrderByWithAggregationInputSchema ]).optional(),
  by: CartScalarFieldEnumSchema.array(), 
  having: CartScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CartFindUniqueArgsSchema: z.ZodType<Prisma.CartFindUniqueArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereUniqueInputSchema, 
}).strict();

export const CartFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CartFindUniqueOrThrowArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereUniqueInputSchema, 
}).strict();

export const CartItemFindFirstArgsSchema: z.ZodType<Prisma.CartItemFindFirstArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereInputSchema.optional(), 
  orderBy: z.union([ CartItemOrderByWithRelationInputSchema.array(), CartItemOrderByWithRelationInputSchema ]).optional(),
  cursor: CartItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CartItemScalarFieldEnumSchema, CartItemScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CartItemFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CartItemFindFirstOrThrowArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereInputSchema.optional(), 
  orderBy: z.union([ CartItemOrderByWithRelationInputSchema.array(), CartItemOrderByWithRelationInputSchema ]).optional(),
  cursor: CartItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CartItemScalarFieldEnumSchema, CartItemScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CartItemFindManyArgsSchema: z.ZodType<Prisma.CartItemFindManyArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereInputSchema.optional(), 
  orderBy: z.union([ CartItemOrderByWithRelationInputSchema.array(), CartItemOrderByWithRelationInputSchema ]).optional(),
  cursor: CartItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CartItemScalarFieldEnumSchema, CartItemScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CartItemAggregateArgsSchema: z.ZodType<Prisma.CartItemAggregateArgs> = z.object({
  where: CartItemWhereInputSchema.optional(), 
  orderBy: z.union([ CartItemOrderByWithRelationInputSchema.array(), CartItemOrderByWithRelationInputSchema ]).optional(),
  cursor: CartItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CartItemGroupByArgsSchema: z.ZodType<Prisma.CartItemGroupByArgs> = z.object({
  where: CartItemWhereInputSchema.optional(), 
  orderBy: z.union([ CartItemOrderByWithAggregationInputSchema.array(), CartItemOrderByWithAggregationInputSchema ]).optional(),
  by: CartItemScalarFieldEnumSchema.array(), 
  having: CartItemScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CartItemFindUniqueArgsSchema: z.ZodType<Prisma.CartItemFindUniqueArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereUniqueInputSchema, 
}).strict();

export const CartItemFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CartItemFindUniqueOrThrowArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereUniqueInputSchema, 
}).strict();

export const OrderFindFirstArgsSchema: z.ZodType<Prisma.OrderFindFirstArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(), 
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(), OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema, OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderFindFirstOrThrowArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(), 
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(), OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema, OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderFindManyArgsSchema: z.ZodType<Prisma.OrderFindManyArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereInputSchema.optional(), 
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(), OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderScalarFieldEnumSchema, OrderScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderAggregateArgsSchema: z.ZodType<Prisma.OrderAggregateArgs> = z.object({
  where: OrderWhereInputSchema.optional(), 
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(), OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderGroupByArgsSchema: z.ZodType<Prisma.OrderGroupByArgs> = z.object({
  where: OrderWhereInputSchema.optional(), 
  orderBy: z.union([ OrderOrderByWithAggregationInputSchema.array(), OrderOrderByWithAggregationInputSchema ]).optional(),
  by: OrderScalarFieldEnumSchema.array(), 
  having: OrderScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderFindUniqueArgsSchema: z.ZodType<Prisma.OrderFindUniqueArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema, 
}).strict();

export const OrderFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderFindUniqueOrThrowArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema, 
}).strict();

export const OrderItemFindFirstArgsSchema: z.ZodType<Prisma.OrderItemFindFirstArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereInputSchema.optional(), 
  orderBy: z.union([ OrderItemOrderByWithRelationInputSchema.array(), OrderItemOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderItemScalarFieldEnumSchema, OrderItemScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderItemFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderItemFindFirstOrThrowArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereInputSchema.optional(), 
  orderBy: z.union([ OrderItemOrderByWithRelationInputSchema.array(), OrderItemOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderItemScalarFieldEnumSchema, OrderItemScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderItemFindManyArgsSchema: z.ZodType<Prisma.OrderItemFindManyArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereInputSchema.optional(), 
  orderBy: z.union([ OrderItemOrderByWithRelationInputSchema.array(), OrderItemOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderItemScalarFieldEnumSchema, OrderItemScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderItemAggregateArgsSchema: z.ZodType<Prisma.OrderItemAggregateArgs> = z.object({
  where: OrderItemWhereInputSchema.optional(), 
  orderBy: z.union([ OrderItemOrderByWithRelationInputSchema.array(), OrderItemOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderItemWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderItemGroupByArgsSchema: z.ZodType<Prisma.OrderItemGroupByArgs> = z.object({
  where: OrderItemWhereInputSchema.optional(), 
  orderBy: z.union([ OrderItemOrderByWithAggregationInputSchema.array(), OrderItemOrderByWithAggregationInputSchema ]).optional(),
  by: OrderItemScalarFieldEnumSchema.array(), 
  having: OrderItemScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderItemFindUniqueArgsSchema: z.ZodType<Prisma.OrderItemFindUniqueArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereUniqueInputSchema, 
}).strict();

export const OrderItemFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderItemFindUniqueOrThrowArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereUniqueInputSchema, 
}).strict();

export const PaymentFindFirstArgsSchema: z.ZodType<Prisma.PaymentFindFirstArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereInputSchema.optional(), 
  orderBy: z.union([ PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema ]).optional(),
  cursor: PaymentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PaymentScalarFieldEnumSchema, PaymentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PaymentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PaymentFindFirstOrThrowArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereInputSchema.optional(), 
  orderBy: z.union([ PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema ]).optional(),
  cursor: PaymentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PaymentScalarFieldEnumSchema, PaymentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PaymentFindManyArgsSchema: z.ZodType<Prisma.PaymentFindManyArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereInputSchema.optional(), 
  orderBy: z.union([ PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema ]).optional(),
  cursor: PaymentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PaymentScalarFieldEnumSchema, PaymentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PaymentAggregateArgsSchema: z.ZodType<Prisma.PaymentAggregateArgs> = z.object({
  where: PaymentWhereInputSchema.optional(), 
  orderBy: z.union([ PaymentOrderByWithRelationInputSchema.array(), PaymentOrderByWithRelationInputSchema ]).optional(),
  cursor: PaymentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PaymentGroupByArgsSchema: z.ZodType<Prisma.PaymentGroupByArgs> = z.object({
  where: PaymentWhereInputSchema.optional(), 
  orderBy: z.union([ PaymentOrderByWithAggregationInputSchema.array(), PaymentOrderByWithAggregationInputSchema ]).optional(),
  by: PaymentScalarFieldEnumSchema.array(), 
  having: PaymentScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PaymentFindUniqueArgsSchema: z.ZodType<Prisma.PaymentFindUniqueArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereUniqueInputSchema, 
}).strict();

export const PaymentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PaymentFindUniqueOrThrowArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereUniqueInputSchema, 
}).strict();

export const ReviewFindFirstArgsSchema: z.ZodType<Prisma.ReviewFindFirstArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereInputSchema.optional(), 
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(), ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema, ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ReviewFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReviewFindFirstOrThrowArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereInputSchema.optional(), 
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(), ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema, ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ReviewFindManyArgsSchema: z.ZodType<Prisma.ReviewFindManyArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereInputSchema.optional(), 
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(), ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema, ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const ReviewAggregateArgsSchema: z.ZodType<Prisma.ReviewAggregateArgs> = z.object({
  where: ReviewWhereInputSchema.optional(), 
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(), ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ReviewGroupByArgsSchema: z.ZodType<Prisma.ReviewGroupByArgs> = z.object({
  where: ReviewWhereInputSchema.optional(), 
  orderBy: z.union([ ReviewOrderByWithAggregationInputSchema.array(), ReviewOrderByWithAggregationInputSchema ]).optional(),
  by: ReviewScalarFieldEnumSchema.array(), 
  having: ReviewScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const ReviewFindUniqueArgsSchema: z.ZodType<Prisma.ReviewFindUniqueArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema, 
}).strict();

export const ReviewFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReviewFindUniqueOrThrowArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema, 
}).strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
}).strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
  create: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
}).strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CategoryCreateArgsSchema: z.ZodType<Prisma.CategoryCreateArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  data: z.union([ CategoryCreateInputSchema, CategoryUncheckedCreateInputSchema ]),
}).strict();

export const CategoryUpsertArgsSchema: z.ZodType<Prisma.CategoryUpsertArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereUniqueInputSchema, 
  create: z.union([ CategoryCreateInputSchema, CategoryUncheckedCreateInputSchema ]),
  update: z.union([ CategoryUpdateInputSchema, CategoryUncheckedUpdateInputSchema ]),
}).strict();

export const CategoryCreateManyArgsSchema: z.ZodType<Prisma.CategoryCreateManyArgs> = z.object({
  data: z.union([ CategoryCreateManyInputSchema, CategoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CategoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ CategoryCreateManyInputSchema, CategoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CategoryDeleteArgsSchema: z.ZodType<Prisma.CategoryDeleteArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  where: CategoryWhereUniqueInputSchema, 
}).strict();

export const CategoryUpdateArgsSchema: z.ZodType<Prisma.CategoryUpdateArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: CategoryIncludeSchema.optional(),
  data: z.union([ CategoryUpdateInputSchema, CategoryUncheckedUpdateInputSchema ]),
  where: CategoryWhereUniqueInputSchema, 
}).strict();

export const CategoryUpdateManyArgsSchema: z.ZodType<Prisma.CategoryUpdateManyArgs> = z.object({
  data: z.union([ CategoryUpdateManyMutationInputSchema, CategoryUncheckedUpdateManyInputSchema ]),
  where: CategoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CategoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CategoryUpdateManyMutationInputSchema, CategoryUncheckedUpdateManyInputSchema ]),
  where: CategoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CategoryDeleteManyArgsSchema: z.ZodType<Prisma.CategoryDeleteManyArgs> = z.object({
  where: CategoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductCreateArgsSchema: z.ZodType<Prisma.ProductCreateArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  data: z.union([ ProductCreateInputSchema, ProductUncheckedCreateInputSchema ]),
}).strict();

export const ProductUpsertArgsSchema: z.ZodType<Prisma.ProductUpsertArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
  create: z.union([ ProductCreateInputSchema, ProductUncheckedCreateInputSchema ]),
  update: z.union([ ProductUpdateInputSchema, ProductUncheckedUpdateInputSchema ]),
}).strict();

export const ProductCreateManyArgsSchema: z.ZodType<Prisma.ProductCreateManyArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema, ProductCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema, ProductCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductDeleteArgsSchema: z.ZodType<Prisma.ProductDeleteArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductUpdateArgsSchema: z.ZodType<Prisma.ProductUpdateArgs> = z.object({
  select: ProductSelectSchema.optional(),
  include: ProductIncludeSchema.optional(),
  data: z.union([ ProductUpdateInputSchema, ProductUncheckedUpdateInputSchema ]),
  where: ProductWhereUniqueInputSchema, 
}).strict();

export const ProductUpdateManyArgsSchema: z.ZodType<Prisma.ProductUpdateManyArgs> = z.object({
  data: z.union([ ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema ]),
  where: ProductWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProductUpdateManyMutationInputSchema, ProductUncheckedUpdateManyInputSchema ]),
  where: ProductWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductDeleteManyArgsSchema: z.ZodType<Prisma.ProductDeleteManyArgs> = z.object({
  where: ProductWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductColorCreateArgsSchema: z.ZodType<Prisma.ProductColorCreateArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  data: z.union([ ProductColorCreateInputSchema, ProductColorUncheckedCreateInputSchema ]),
}).strict();

export const ProductColorUpsertArgsSchema: z.ZodType<Prisma.ProductColorUpsertArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereUniqueInputSchema, 
  create: z.union([ ProductColorCreateInputSchema, ProductColorUncheckedCreateInputSchema ]),
  update: z.union([ ProductColorUpdateInputSchema, ProductColorUncheckedUpdateInputSchema ]),
}).strict();

export const ProductColorCreateManyArgsSchema: z.ZodType<Prisma.ProductColorCreateManyArgs> = z.object({
  data: z.union([ ProductColorCreateManyInputSchema, ProductColorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductColorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductColorCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductColorCreateManyInputSchema, ProductColorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductColorDeleteArgsSchema: z.ZodType<Prisma.ProductColorDeleteArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  where: ProductColorWhereUniqueInputSchema, 
}).strict();

export const ProductColorUpdateArgsSchema: z.ZodType<Prisma.ProductColorUpdateArgs> = z.object({
  select: ProductColorSelectSchema.optional(),
  include: ProductColorIncludeSchema.optional(),
  data: z.union([ ProductColorUpdateInputSchema, ProductColorUncheckedUpdateInputSchema ]),
  where: ProductColorWhereUniqueInputSchema, 
}).strict();

export const ProductColorUpdateManyArgsSchema: z.ZodType<Prisma.ProductColorUpdateManyArgs> = z.object({
  data: z.union([ ProductColorUpdateManyMutationInputSchema, ProductColorUncheckedUpdateManyInputSchema ]),
  where: ProductColorWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductColorUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductColorUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProductColorUpdateManyMutationInputSchema, ProductColorUncheckedUpdateManyInputSchema ]),
  where: ProductColorWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductColorDeleteManyArgsSchema: z.ZodType<Prisma.ProductColorDeleteManyArgs> = z.object({
  where: ProductColorWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductVariantCreateArgsSchema: z.ZodType<Prisma.ProductVariantCreateArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  data: z.union([ ProductVariantCreateInputSchema, ProductVariantUncheckedCreateInputSchema ]),
}).strict();

export const ProductVariantUpsertArgsSchema: z.ZodType<Prisma.ProductVariantUpsertArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereUniqueInputSchema, 
  create: z.union([ ProductVariantCreateInputSchema, ProductVariantUncheckedCreateInputSchema ]),
  update: z.union([ ProductVariantUpdateInputSchema, ProductVariantUncheckedUpdateInputSchema ]),
}).strict();

export const ProductVariantCreateManyArgsSchema: z.ZodType<Prisma.ProductVariantCreateManyArgs> = z.object({
  data: z.union([ ProductVariantCreateManyInputSchema, ProductVariantCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductVariantCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductVariantCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductVariantCreateManyInputSchema, ProductVariantCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ProductVariantDeleteArgsSchema: z.ZodType<Prisma.ProductVariantDeleteArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  where: ProductVariantWhereUniqueInputSchema, 
}).strict();

export const ProductVariantUpdateArgsSchema: z.ZodType<Prisma.ProductVariantUpdateArgs> = z.object({
  select: ProductVariantSelectSchema.optional(),
  include: ProductVariantIncludeSchema.optional(),
  data: z.union([ ProductVariantUpdateInputSchema, ProductVariantUncheckedUpdateInputSchema ]),
  where: ProductVariantWhereUniqueInputSchema, 
}).strict();

export const ProductVariantUpdateManyArgsSchema: z.ZodType<Prisma.ProductVariantUpdateManyArgs> = z.object({
  data: z.union([ ProductVariantUpdateManyMutationInputSchema, ProductVariantUncheckedUpdateManyInputSchema ]),
  where: ProductVariantWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductVariantUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductVariantUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProductVariantUpdateManyMutationInputSchema, ProductVariantUncheckedUpdateManyInputSchema ]),
  where: ProductVariantWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ProductVariantDeleteManyArgsSchema: z.ZodType<Prisma.ProductVariantDeleteManyArgs> = z.object({
  where: ProductVariantWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CartCreateArgsSchema: z.ZodType<Prisma.CartCreateArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  data: z.union([ CartCreateInputSchema, CartUncheckedCreateInputSchema ]),
}).strict();

export const CartUpsertArgsSchema: z.ZodType<Prisma.CartUpsertArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereUniqueInputSchema, 
  create: z.union([ CartCreateInputSchema, CartUncheckedCreateInputSchema ]),
  update: z.union([ CartUpdateInputSchema, CartUncheckedUpdateInputSchema ]),
}).strict();

export const CartCreateManyArgsSchema: z.ZodType<Prisma.CartCreateManyArgs> = z.object({
  data: z.union([ CartCreateManyInputSchema, CartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CartCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CartCreateManyAndReturnArgs> = z.object({
  data: z.union([ CartCreateManyInputSchema, CartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CartDeleteArgsSchema: z.ZodType<Prisma.CartDeleteArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  where: CartWhereUniqueInputSchema, 
}).strict();

export const CartUpdateArgsSchema: z.ZodType<Prisma.CartUpdateArgs> = z.object({
  select: CartSelectSchema.optional(),
  include: CartIncludeSchema.optional(),
  data: z.union([ CartUpdateInputSchema, CartUncheckedUpdateInputSchema ]),
  where: CartWhereUniqueInputSchema, 
}).strict();

export const CartUpdateManyArgsSchema: z.ZodType<Prisma.CartUpdateManyArgs> = z.object({
  data: z.union([ CartUpdateManyMutationInputSchema, CartUncheckedUpdateManyInputSchema ]),
  where: CartWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CartUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CartUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CartUpdateManyMutationInputSchema, CartUncheckedUpdateManyInputSchema ]),
  where: CartWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CartDeleteManyArgsSchema: z.ZodType<Prisma.CartDeleteManyArgs> = z.object({
  where: CartWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CartItemCreateArgsSchema: z.ZodType<Prisma.CartItemCreateArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  data: z.union([ CartItemCreateInputSchema, CartItemUncheckedCreateInputSchema ]),
}).strict();

export const CartItemUpsertArgsSchema: z.ZodType<Prisma.CartItemUpsertArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereUniqueInputSchema, 
  create: z.union([ CartItemCreateInputSchema, CartItemUncheckedCreateInputSchema ]),
  update: z.union([ CartItemUpdateInputSchema, CartItemUncheckedUpdateInputSchema ]),
}).strict();

export const CartItemCreateManyArgsSchema: z.ZodType<Prisma.CartItemCreateManyArgs> = z.object({
  data: z.union([ CartItemCreateManyInputSchema, CartItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CartItemCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CartItemCreateManyAndReturnArgs> = z.object({
  data: z.union([ CartItemCreateManyInputSchema, CartItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CartItemDeleteArgsSchema: z.ZodType<Prisma.CartItemDeleteArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  where: CartItemWhereUniqueInputSchema, 
}).strict();

export const CartItemUpdateArgsSchema: z.ZodType<Prisma.CartItemUpdateArgs> = z.object({
  select: CartItemSelectSchema.optional(),
  include: CartItemIncludeSchema.optional(),
  data: z.union([ CartItemUpdateInputSchema, CartItemUncheckedUpdateInputSchema ]),
  where: CartItemWhereUniqueInputSchema, 
}).strict();

export const CartItemUpdateManyArgsSchema: z.ZodType<Prisma.CartItemUpdateManyArgs> = z.object({
  data: z.union([ CartItemUpdateManyMutationInputSchema, CartItemUncheckedUpdateManyInputSchema ]),
  where: CartItemWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CartItemUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CartItemUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CartItemUpdateManyMutationInputSchema, CartItemUncheckedUpdateManyInputSchema ]),
  where: CartItemWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CartItemDeleteManyArgsSchema: z.ZodType<Prisma.CartItemDeleteManyArgs> = z.object({
  where: CartItemWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderCreateArgsSchema: z.ZodType<Prisma.OrderCreateArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  data: z.union([ OrderCreateInputSchema, OrderUncheckedCreateInputSchema ]),
}).strict();

export const OrderUpsertArgsSchema: z.ZodType<Prisma.OrderUpsertArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema, 
  create: z.union([ OrderCreateInputSchema, OrderUncheckedCreateInputSchema ]),
  update: z.union([ OrderUpdateInputSchema, OrderUncheckedUpdateInputSchema ]),
}).strict();

export const OrderCreateManyArgsSchema: z.ZodType<Prisma.OrderCreateManyArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema, OrderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema, OrderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderDeleteArgsSchema: z.ZodType<Prisma.OrderDeleteArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  where: OrderWhereUniqueInputSchema, 
}).strict();

export const OrderUpdateArgsSchema: z.ZodType<Prisma.OrderUpdateArgs> = z.object({
  select: OrderSelectSchema.optional(),
  include: OrderIncludeSchema.optional(),
  data: z.union([ OrderUpdateInputSchema, OrderUncheckedUpdateInputSchema ]),
  where: OrderWhereUniqueInputSchema, 
}).strict();

export const OrderUpdateManyArgsSchema: z.ZodType<Prisma.OrderUpdateManyArgs> = z.object({
  data: z.union([ OrderUpdateManyMutationInputSchema, OrderUncheckedUpdateManyInputSchema ]),
  where: OrderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderUpdateManyAndReturnArgs> = z.object({
  data: z.union([ OrderUpdateManyMutationInputSchema, OrderUncheckedUpdateManyInputSchema ]),
  where: OrderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderDeleteManyArgsSchema: z.ZodType<Prisma.OrderDeleteManyArgs> = z.object({
  where: OrderWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderItemCreateArgsSchema: z.ZodType<Prisma.OrderItemCreateArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  data: z.union([ OrderItemCreateInputSchema, OrderItemUncheckedCreateInputSchema ]),
}).strict();

export const OrderItemUpsertArgsSchema: z.ZodType<Prisma.OrderItemUpsertArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereUniqueInputSchema, 
  create: z.union([ OrderItemCreateInputSchema, OrderItemUncheckedCreateInputSchema ]),
  update: z.union([ OrderItemUpdateInputSchema, OrderItemUncheckedUpdateInputSchema ]),
}).strict();

export const OrderItemCreateManyArgsSchema: z.ZodType<Prisma.OrderItemCreateManyArgs> = z.object({
  data: z.union([ OrderItemCreateManyInputSchema, OrderItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderItemCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderItemCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderItemCreateManyInputSchema, OrderItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderItemDeleteArgsSchema: z.ZodType<Prisma.OrderItemDeleteArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  where: OrderItemWhereUniqueInputSchema, 
}).strict();

export const OrderItemUpdateArgsSchema: z.ZodType<Prisma.OrderItemUpdateArgs> = z.object({
  select: OrderItemSelectSchema.optional(),
  include: OrderItemIncludeSchema.optional(),
  data: z.union([ OrderItemUpdateInputSchema, OrderItemUncheckedUpdateInputSchema ]),
  where: OrderItemWhereUniqueInputSchema, 
}).strict();

export const OrderItemUpdateManyArgsSchema: z.ZodType<Prisma.OrderItemUpdateManyArgs> = z.object({
  data: z.union([ OrderItemUpdateManyMutationInputSchema, OrderItemUncheckedUpdateManyInputSchema ]),
  where: OrderItemWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderItemUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderItemUpdateManyAndReturnArgs> = z.object({
  data: z.union([ OrderItemUpdateManyMutationInputSchema, OrderItemUncheckedUpdateManyInputSchema ]),
  where: OrderItemWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderItemDeleteManyArgsSchema: z.ZodType<Prisma.OrderItemDeleteManyArgs> = z.object({
  where: OrderItemWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PaymentCreateArgsSchema: z.ZodType<Prisma.PaymentCreateArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  data: z.union([ PaymentCreateInputSchema, PaymentUncheckedCreateInputSchema ]),
}).strict();

export const PaymentUpsertArgsSchema: z.ZodType<Prisma.PaymentUpsertArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereUniqueInputSchema, 
  create: z.union([ PaymentCreateInputSchema, PaymentUncheckedCreateInputSchema ]),
  update: z.union([ PaymentUpdateInputSchema, PaymentUncheckedUpdateInputSchema ]),
}).strict();

export const PaymentCreateManyArgsSchema: z.ZodType<Prisma.PaymentCreateManyArgs> = z.object({
  data: z.union([ PaymentCreateManyInputSchema, PaymentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PaymentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PaymentCreateManyAndReturnArgs> = z.object({
  data: z.union([ PaymentCreateManyInputSchema, PaymentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PaymentDeleteArgsSchema: z.ZodType<Prisma.PaymentDeleteArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  where: PaymentWhereUniqueInputSchema, 
}).strict();

export const PaymentUpdateArgsSchema: z.ZodType<Prisma.PaymentUpdateArgs> = z.object({
  select: PaymentSelectSchema.optional(),
  include: PaymentIncludeSchema.optional(),
  data: z.union([ PaymentUpdateInputSchema, PaymentUncheckedUpdateInputSchema ]),
  where: PaymentWhereUniqueInputSchema, 
}).strict();

export const PaymentUpdateManyArgsSchema: z.ZodType<Prisma.PaymentUpdateManyArgs> = z.object({
  data: z.union([ PaymentUpdateManyMutationInputSchema, PaymentUncheckedUpdateManyInputSchema ]),
  where: PaymentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PaymentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PaymentUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PaymentUpdateManyMutationInputSchema, PaymentUncheckedUpdateManyInputSchema ]),
  where: PaymentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PaymentDeleteManyArgsSchema: z.ZodType<Prisma.PaymentDeleteManyArgs> = z.object({
  where: PaymentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ReviewCreateArgsSchema: z.ZodType<Prisma.ReviewCreateArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  data: z.union([ ReviewCreateInputSchema, ReviewUncheckedCreateInputSchema ]),
}).strict();

export const ReviewUpsertArgsSchema: z.ZodType<Prisma.ReviewUpsertArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema, 
  create: z.union([ ReviewCreateInputSchema, ReviewUncheckedCreateInputSchema ]),
  update: z.union([ ReviewUpdateInputSchema, ReviewUncheckedUpdateInputSchema ]),
}).strict();

export const ReviewCreateManyArgsSchema: z.ZodType<Prisma.ReviewCreateManyArgs> = z.object({
  data: z.union([ ReviewCreateManyInputSchema, ReviewCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ReviewCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReviewCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReviewCreateManyInputSchema, ReviewCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const ReviewDeleteArgsSchema: z.ZodType<Prisma.ReviewDeleteArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  where: ReviewWhereUniqueInputSchema, 
}).strict();

export const ReviewUpdateArgsSchema: z.ZodType<Prisma.ReviewUpdateArgs> = z.object({
  select: ReviewSelectSchema.optional(),
  include: ReviewIncludeSchema.optional(),
  data: z.union([ ReviewUpdateInputSchema, ReviewUncheckedUpdateInputSchema ]),
  where: ReviewWhereUniqueInputSchema, 
}).strict();

export const ReviewUpdateManyArgsSchema: z.ZodType<Prisma.ReviewUpdateManyArgs> = z.object({
  data: z.union([ ReviewUpdateManyMutationInputSchema, ReviewUncheckedUpdateManyInputSchema ]),
  where: ReviewWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ReviewUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ReviewUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ReviewUpdateManyMutationInputSchema, ReviewUncheckedUpdateManyInputSchema ]),
  where: ReviewWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const ReviewDeleteManyArgsSchema: z.ZodType<Prisma.ReviewDeleteManyArgs> = z.object({
  where: ReviewWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();