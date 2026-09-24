import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;

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

export const UserScalarFieldEnumSchema = z.enum(['id','fullName','email','password','address','phone','role','status','createdAt','updatedAt','deletedAt','createdBy']);

export const VoucherScalarFieldEnumSchema = z.enum(['id','userId','code','name','scope','discountType','discountValue','minOrderAmount','maxDiscountAmount','quantity','usedQuantity','perUserLimit','startDate','endDate','status','createdAt','updatedAt','deletedAt']);

export const VoucherDetailScalarFieldEnumSchema = z.enum(['id','voucherId','productId','orderId','eligibleAmount','discountAmount','sequence','createdAt','reversedAt']);

export const CategoryScalarFieldEnumSchema = z.enum(['id','name','slug','createdAt','updatedAt','deletedAt']);

export const ProductScalarFieldEnumSchema = z.enum(['id','categoryId','vendorId','name','slug','description','status','createdAt','updatedAt','deletedAt']);

export const ProductColorScalarFieldEnumSchema = z.enum(['id','productId','color','imageUrls','createdAt','updatedAt','deletedAt']);

export const ProductVariantScalarFieldEnumSchema = z.enum(['id','productColorId','stock','size','price','createdAt','updatedAt','deletedAt']);

export const ReviewScalarFieldEnumSchema = z.enum(['id','userId','productId','orderDetailId','content','rating','createdAt','updatedAt','deletedAt']);

export const CartScalarFieldEnumSchema = z.enum(['id','userId','createdAt','updatedAt','deletedAt']);

export const CartItemScalarFieldEnumSchema = z.enum(['id','productVariantId','cartId','quantity','createdAt','updatedAt']);

export const OrderScalarFieldEnumSchema = z.enum(['id','orderCode','userId','subtotalAmount','discountAmount','shippingFee','totalAmount','status','notes','receiverName','receiverPhone','shippingAddress','createdAt','updatedAt','cancelledAt']);

export const OrderDetailScalarFieldEnumSchema = z.enum(['id','orderId','productVariantId','quantity','price','productName','colorName','sizeName','imageUrl']);

export const PaymentScalarFieldEnumSchema = z.enum(['id','orderId','method','amount','status','transactionCode','gateway','gatewayResponse','paidAt','failedAt','createdAt','updatedAt']);

export const OrderStatusHistoryScalarFieldEnumSchema = z.enum(['id','orderId','actorId','fromStatus','toStatus','note','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema: z.ZodType<Prisma.NullableJsonNullValueInput> = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema: z.ZodType<Prisma.JsonNullValueFilter> = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const UserRoleSchema = z.enum(['customer','vendor','admin']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export const UserStatusSchema = z.enum(['active','inactive']);

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

export const SurveyStatusSchema = z.enum(['draft','active','closed']);

export type SurveyStatusType = `${z.infer<typeof SurveyStatusSchema>}`

export const VoucherStatusSchema = z.enum(['draft','active','inactive','expired']);

export type VoucherStatusType = `${z.infer<typeof VoucherStatusSchema>}`

export const VoucherScopeSchema = z.enum(['platform','vendor']);

export type VoucherScopeType = `${z.infer<typeof VoucherScopeSchema>}`

export const DiscountTypeSchema = z.enum(['percentage','fixed_amount']);

export type DiscountTypeType = `${z.infer<typeof DiscountTypeSchema>}`

export const ProductStatusSchema = z.enum(['draft','active','inactive']);

export type ProductStatusType = `${z.infer<typeof ProductStatusSchema>}`

export const OrderStatusSchema = z.enum(['pending','confirmed','processing','shipping','completed','cancelled']);

export type OrderStatusType = `${z.infer<typeof OrderStatusSchema>}`

export const PaymentMethodSchema = z.enum(['cod','vnpay','momo','zalopay','bank_transfer']);

export type PaymentMethodType = `${z.infer<typeof PaymentMethodSchema>}`

export const PaymentStatusSchema = z.enum(['pending','paid','failed','cancelled','refunded']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: UserRoleSchema,
  status: UserStatusSchema,
  id: z.uuid(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  createdBy: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// VOUCHER SCHEMA
/////////////////////////////////////////

export const VoucherSchema = z.object({
  scope: VoucherScopeSchema,
  discountType: DiscountTypeSchema,
  status: VoucherStatusSchema,
  id: z.uuid(),
  userId: z.string(),
  code: z.string(),
  name: z.string(),
  discountValue: z.instanceof(Prisma.Decimal, { message: "Field 'discountValue' must be a Decimal. Location: ['Models', 'Voucher']"}),
  minOrderAmount: z.instanceof(Prisma.Decimal, { message: "Field 'minOrderAmount' must be a Decimal. Location: ['Models', 'Voucher']"}).nullable(),
  maxDiscountAmount: z.instanceof(Prisma.Decimal, { message: "Field 'maxDiscountAmount' must be a Decimal. Location: ['Models', 'Voucher']"}).nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int(),
  perUserLimit: z.number().int(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Voucher = z.infer<typeof VoucherSchema>

/////////////////////////////////////////
// VOUCHER DETAIL SCHEMA
/////////////////////////////////////////

export const VoucherDetailSchema = z.object({
  id: z.uuid(),
  voucherId: z.string(),
  productId: z.string().nullable(),
  orderId: z.string().nullable(),
  eligibleAmount: z.instanceof(Prisma.Decimal, { message: "Field 'eligibleAmount' must be a Decimal. Location: ['Models', 'VoucherDetail']"}).nullable(),
  discountAmount: z.instanceof(Prisma.Decimal, { message: "Field 'discountAmount' must be a Decimal. Location: ['Models', 'VoucherDetail']"}).nullable(),
  sequence: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  reversedAt: z.coerce.date().nullable(),
})

export type VoucherDetail = z.infer<typeof VoucherDetailSchema>

/////////////////////////////////////////
// CATEGORY SCHEMA
/////////////////////////////////////////

export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
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
  categoryId: z.string(),
  vendorId: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
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
  imageUrls: z.string().array(),
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
  stock: z.number().int(),
  size: z.string(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'ProductVariant']"}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type ProductVariant = z.infer<typeof ProductVariantSchema>

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  productId: z.string(),
  orderDetailId: z.string(),
  content: z.string().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Review = z.infer<typeof ReviewSchema>

/////////////////////////////////////////
// CART SCHEMA
/////////////////////////////////////////

export const CartSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Cart = z.infer<typeof CartSchema>

/////////////////////////////////////////
// CART ITEM SCHEMA
/////////////////////////////////////////

export const CartItemSchema = z.object({
  id: z.uuid(),
  productVariantId: z.string(),
  cartId: z.string(),
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
  orderCode: z.cuid(),
  userId: z.string(),
  subtotalAmount: z.instanceof(Prisma.Decimal, { message: "Field 'subtotalAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  discountAmount: z.instanceof(Prisma.Decimal, { message: "Field 'discountAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  shippingFee: z.instanceof(Prisma.Decimal, { message: "Field 'shippingFee' must be a Decimal. Location: ['Models', 'Order']"}),
  totalAmount: z.instanceof(Prisma.Decimal, { message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  notes: z.string().nullable(),
  receiverName: z.string().nullable(),
  receiverPhone: z.string().nullable(),
  shippingAddress: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  cancelledAt: z.coerce.date().nullable(),
})

export type Order = z.infer<typeof OrderSchema>

/////////////////////////////////////////
// ORDER DETAIL SCHEMA
/////////////////////////////////////////

export const OrderDetailSchema = z.object({
  id: z.uuid(),
  orderId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'OrderDetail']"}),
  productName: z.string().nullable(),
  colorName: z.string().nullable(),
  sizeName: z.string().nullable(),
  imageUrl: z.string().nullable(),
})

export type OrderDetail = z.infer<typeof OrderDetailSchema>

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  id: z.uuid(),
  orderId: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'Payment']"}),
  transactionCode: z.string().nullable(),
  gateway: z.string().nullable(),
  gatewayResponse: JsonValueSchema.nullable(),
  paidAt: z.coerce.date().nullable(),
  failedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Payment = z.infer<typeof PaymentSchema>

/////////////////////////////////////////
// ORDER STATUS HISTORY SCHEMA
/////////////////////////////////////////

export const OrderStatusHistorySchema = z.object({
  fromStatus: OrderStatusSchema.nullable(),
  toStatus: OrderStatusSchema,
  id: z.uuid(),
  orderId: z.string(),
  actorId: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  vouchers: z.union([z.boolean(),z.lazy(() => VoucherFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  orderStatusHistories: z.union([z.boolean(),z.lazy(() => OrderStatusHistoryFindManyArgsSchema)]).optional(),
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
  vouchers: z.boolean().optional(),
  reviews: z.boolean().optional(),
  orders: z.boolean().optional(),
  products: z.boolean().optional(),
  orderStatusHistories: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  fullName: z.boolean().optional(),
  email: z.boolean().optional(),
  password: z.boolean().optional(),
  address: z.boolean().optional(),
  phone: z.boolean().optional(),
  role: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  createdBy: z.boolean().optional(),
  vouchers: z.union([z.boolean(),z.lazy(() => VoucherFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  orderStatusHistories: z.union([z.boolean(),z.lazy(() => OrderStatusHistoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// VOUCHER
//------------------------------------------------------

export const VoucherIncludeSchema: z.ZodType<Prisma.VoucherInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  details: z.union([z.boolean(),z.lazy(() => VoucherDetailFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => VoucherCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const VoucherArgsSchema: z.ZodType<Prisma.VoucherDefaultArgs> = z.object({
  select: z.lazy(() => VoucherSelectSchema).optional(),
  include: z.lazy(() => VoucherIncludeSchema).optional(),
}).strict();

export const VoucherCountOutputTypeArgsSchema: z.ZodType<Prisma.VoucherCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => VoucherCountOutputTypeSelectSchema).nullish(),
}).strict();

export const VoucherCountOutputTypeSelectSchema: z.ZodType<Prisma.VoucherCountOutputTypeSelect> = z.object({
  details: z.boolean().optional(),
}).strict();

export const VoucherSelectSchema: z.ZodType<Prisma.VoucherSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  code: z.boolean().optional(),
  name: z.boolean().optional(),
  scope: z.boolean().optional(),
  discountType: z.boolean().optional(),
  discountValue: z.boolean().optional(),
  minOrderAmount: z.boolean().optional(),
  maxDiscountAmount: z.boolean().optional(),
  quantity: z.boolean().optional(),
  usedQuantity: z.boolean().optional(),
  perUserLimit: z.boolean().optional(),
  startDate: z.boolean().optional(),
  endDate: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  details: z.union([z.boolean(),z.lazy(() => VoucherDetailFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => VoucherCountOutputTypeArgsSchema)]).optional(),
}).strict()

// VOUCHER DETAIL
//------------------------------------------------------

export const VoucherDetailIncludeSchema: z.ZodType<Prisma.VoucherDetailInclude> = z.object({
  voucher: z.union([z.boolean(),z.lazy(() => VoucherArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict();

export const VoucherDetailArgsSchema: z.ZodType<Prisma.VoucherDetailDefaultArgs> = z.object({
  select: z.lazy(() => VoucherDetailSelectSchema).optional(),
  include: z.lazy(() => VoucherDetailIncludeSchema).optional(),
}).strict();

export const VoucherDetailSelectSchema: z.ZodType<Prisma.VoucherDetailSelect> = z.object({
  id: z.boolean().optional(),
  voucherId: z.boolean().optional(),
  productId: z.boolean().optional(),
  orderId: z.boolean().optional(),
  eligibleAmount: z.boolean().optional(),
  discountAmount: z.boolean().optional(),
  sequence: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  reversedAt: z.boolean().optional(),
  voucher: z.union([z.boolean(),z.lazy(() => VoucherArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
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
  vendor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  colors: z.union([z.boolean(),z.lazy(() => ProductColorFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  voucherDetails: z.union([z.boolean(),z.lazy(() => VoucherDetailFindManyArgsSchema)]).optional(),
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
  voucherDetails: z.boolean().optional(),
}).strict();

export const ProductSelectSchema: z.ZodType<Prisma.ProductSelect> = z.object({
  id: z.boolean().optional(),
  categoryId: z.boolean().optional(),
  vendorId: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  description: z.boolean().optional(),
  status: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  vendor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  colors: z.union([z.boolean(),z.lazy(() => ProductColorFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  voucherDetails: z.union([z.boolean(),z.lazy(() => VoucherDetailFindManyArgsSchema)]).optional(),
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
  imageUrls: z.boolean().optional(),
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
  orderDetails: z.union([z.boolean(),z.lazy(() => OrderDetailFindManyArgsSchema)]).optional(),
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
  orderDetails: z.boolean().optional(),
}).strict();

export const ProductVariantSelectSchema: z.ZodType<Prisma.ProductVariantSelect> = z.object({
  id: z.boolean().optional(),
  productColorId: z.boolean().optional(),
  stock: z.boolean().optional(),
  size: z.boolean().optional(),
  price: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  productColor: z.union([z.boolean(),z.lazy(() => ProductColorArgsSchema)]).optional(),
  cartItems: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  orderDetails: z.union([z.boolean(),z.lazy(() => OrderDetailFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductVariantCountOutputTypeArgsSchema)]).optional(),
}).strict()

// REVIEW
//------------------------------------------------------

export const ReviewIncludeSchema: z.ZodType<Prisma.ReviewInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  orderDetail: z.union([z.boolean(),z.lazy(() => OrderDetailArgsSchema)]).optional(),
}).strict();

export const ReviewArgsSchema: z.ZodType<Prisma.ReviewDefaultArgs> = z.object({
  select: z.lazy(() => ReviewSelectSchema).optional(),
  include: z.lazy(() => ReviewIncludeSchema).optional(),
}).strict();

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  productId: z.boolean().optional(),
  orderDetailId: z.boolean().optional(),
  content: z.boolean().optional(),
  rating: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  orderDetail: z.union([z.boolean(),z.lazy(() => OrderDetailArgsSchema)]).optional(),
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
  deletedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CartCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CART ITEM
//------------------------------------------------------

export const CartItemIncludeSchema: z.ZodType<Prisma.CartItemInclude> = z.object({
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
}).strict();

export const CartItemArgsSchema: z.ZodType<Prisma.CartItemDefaultArgs> = z.object({
  select: z.lazy(() => CartItemSelectSchema).optional(),
  include: z.lazy(() => CartItemIncludeSchema).optional(),
}).strict();

export const CartItemSelectSchema: z.ZodType<Prisma.CartItemSelect> = z.object({
  id: z.boolean().optional(),
  productVariantId: z.boolean().optional(),
  cartId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
  cart: z.union([z.boolean(),z.lazy(() => CartArgsSchema)]).optional(),
}).strict()

// ORDER
//------------------------------------------------------

export const OrderIncludeSchema: z.ZodType<Prisma.OrderInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  details: z.union([z.boolean(),z.lazy(() => OrderDetailFindManyArgsSchema)]).optional(),
  payment: z.union([z.boolean(),z.lazy(() => PaymentArgsSchema)]).optional(),
  voucherDetails: z.union([z.boolean(),z.lazy(() => VoucherDetailFindManyArgsSchema)]).optional(),
  statusHistory: z.union([z.boolean(),z.lazy(() => OrderStatusHistoryFindManyArgsSchema)]).optional(),
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
  details: z.boolean().optional(),
  voucherDetails: z.boolean().optional(),
  statusHistory: z.boolean().optional(),
}).strict();

export const OrderSelectSchema: z.ZodType<Prisma.OrderSelect> = z.object({
  id: z.boolean().optional(),
  orderCode: z.boolean().optional(),
  userId: z.boolean().optional(),
  subtotalAmount: z.boolean().optional(),
  discountAmount: z.boolean().optional(),
  shippingFee: z.boolean().optional(),
  totalAmount: z.boolean().optional(),
  status: z.boolean().optional(),
  notes: z.boolean().optional(),
  receiverName: z.boolean().optional(),
  receiverPhone: z.boolean().optional(),
  shippingAddress: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  cancelledAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  details: z.union([z.boolean(),z.lazy(() => OrderDetailFindManyArgsSchema)]).optional(),
  payment: z.union([z.boolean(),z.lazy(() => PaymentArgsSchema)]).optional(),
  voucherDetails: z.union([z.boolean(),z.lazy(() => VoucherDetailFindManyArgsSchema)]).optional(),
  statusHistory: z.union([z.boolean(),z.lazy(() => OrderStatusHistoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrderCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ORDER DETAIL
//------------------------------------------------------

export const OrderDetailIncludeSchema: z.ZodType<Prisma.OrderDetailInclude> = z.object({
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
}).strict();

export const OrderDetailArgsSchema: z.ZodType<Prisma.OrderDetailDefaultArgs> = z.object({
  select: z.lazy(() => OrderDetailSelectSchema).optional(),
  include: z.lazy(() => OrderDetailIncludeSchema).optional(),
}).strict();

export const OrderDetailSelectSchema: z.ZodType<Prisma.OrderDetailSelect> = z.object({
  id: z.boolean().optional(),
  orderId: z.boolean().optional(),
  productVariantId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  price: z.boolean().optional(),
  productName: z.boolean().optional(),
  colorName: z.boolean().optional(),
  sizeName: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  productVariant: z.union([z.boolean(),z.lazy(() => ProductVariantArgsSchema)]).optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
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
  amount: z.boolean().optional(),
  status: z.boolean().optional(),
  transactionCode: z.boolean().optional(),
  gateway: z.boolean().optional(),
  gatewayResponse: z.boolean().optional(),
  paidAt: z.boolean().optional(),
  failedAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
}).strict()

// ORDER STATUS HISTORY
//------------------------------------------------------

export const OrderStatusHistoryIncludeSchema: z.ZodType<Prisma.OrderStatusHistoryInclude> = z.object({
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  actor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const OrderStatusHistoryArgsSchema: z.ZodType<Prisma.OrderStatusHistoryDefaultArgs> = z.object({
  select: z.lazy(() => OrderStatusHistorySelectSchema).optional(),
  include: z.lazy(() => OrderStatusHistoryIncludeSchema).optional(),
}).strict();

export const OrderStatusHistorySelectSchema: z.ZodType<Prisma.OrderStatusHistorySelect> = z.object({
  id: z.boolean().optional(),
  orderId: z.boolean().optional(),
  actorId: z.boolean().optional(),
  fromStatus: z.boolean().optional(),
  toStatus: z.boolean().optional(),
  note: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  actor: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  fullName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  phone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdBy: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  cart: z.union([ z.lazy(() => CartNullableScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderListRelationFilterSchema).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  address: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  phone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdBy: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  vouchers: z.lazy(() => VoucherOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  cart: z.lazy(() => CartOrderByWithRelationInputSchema).optional(),
  orders: z.lazy(() => OrderOrderByRelationAggregateInputSchema).optional(),
  products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryOrderByRelationAggregateInputSchema).optional(),
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
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  phone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdBy: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  cart: z.union([ z.lazy(() => CartNullableScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional().nullable(),
  orders: z.lazy(() => OrderListRelationFilterSchema).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryListRelationFilterSchema).optional(),
}));

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  address: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  phone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdBy: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
});

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  fullName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  phone: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  role: z.union([ z.lazy(() => EnumUserRoleWithAggregatesFilterSchema), z.lazy(() => UserRoleSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusWithAggregatesFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdBy: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
});

export const VoucherWhereInputSchema: z.ZodType<Prisma.VoucherWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VoucherWhereInputSchema), z.lazy(() => VoucherWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherWhereInputSchema), z.lazy(() => VoucherWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  scope: z.union([ z.lazy(() => EnumVoucherScopeFilterSchema), z.lazy(() => VoucherScopeSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => EnumDiscountTypeFilterSchema), z.lazy(() => DiscountTypeSchema) ]).optional(),
  discountValue: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  minOrderAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  usedQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  perUserLimit: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumVoucherStatusFilterSchema), z.lazy(() => VoucherStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  details: z.lazy(() => VoucherDetailListRelationFilterSchema).optional(),
});

export const VoucherOrderByWithRelationInputSchema: z.ZodType<Prisma.VoucherOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  discountType: z.lazy(() => SortOrderSchema).optional(),
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  maxDiscountAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  details: z.lazy(() => VoucherDetailOrderByRelationAggregateInputSchema).optional(),
});

export const VoucherWhereUniqueInputSchema: z.ZodType<Prisma.VoucherWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    code: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    code: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  code: z.string().optional(),
  AND: z.union([ z.lazy(() => VoucherWhereInputSchema), z.lazy(() => VoucherWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherWhereInputSchema), z.lazy(() => VoucherWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  scope: z.union([ z.lazy(() => EnumVoucherScopeFilterSchema), z.lazy(() => VoucherScopeSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => EnumDiscountTypeFilterSchema), z.lazy(() => DiscountTypeSchema) ]).optional(),
  discountValue: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  minOrderAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  usedQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  perUserLimit: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumVoucherStatusFilterSchema), z.lazy(() => VoucherStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  details: z.lazy(() => VoucherDetailListRelationFilterSchema).optional(),
}));

export const VoucherOrderByWithAggregationInputSchema: z.ZodType<Prisma.VoucherOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  discountType: z.lazy(() => SortOrderSchema).optional(),
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  maxDiscountAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => VoucherCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => VoucherAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VoucherMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VoucherMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => VoucherSumOrderByAggregateInputSchema).optional(),
});

export const VoucherScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VoucherScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VoucherScalarWhereWithAggregatesInputSchema), z.lazy(() => VoucherScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherScalarWhereWithAggregatesInputSchema), z.lazy(() => VoucherScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  scope: z.union([ z.lazy(() => EnumVoucherScopeWithAggregatesFilterSchema), z.lazy(() => VoucherScopeSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => EnumDiscountTypeWithAggregatesFilterSchema), z.lazy(() => DiscountTypeSchema) ]).optional(),
  discountValue: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  minOrderAmount: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  usedQuantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  perUserLimit: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumVoucherStatusWithAggregatesFilterSchema), z.lazy(() => VoucherStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const VoucherDetailWhereInputSchema: z.ZodType<Prisma.VoucherDetailWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VoucherDetailWhereInputSchema), z.lazy(() => VoucherDetailWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherDetailWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherDetailWhereInputSchema), z.lazy(() => VoucherDetailWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  voucherId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  eligibleAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  discountAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  sequence: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  reversedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  voucher: z.union([ z.lazy(() => VoucherScalarRelationFilterSchema), z.lazy(() => VoucherWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  order: z.union([ z.lazy(() => OrderNullableScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional().nullable(),
});

export const VoucherDetailOrderByWithRelationInputSchema: z.ZodType<Prisma.VoucherDetailOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  voucherId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  orderId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  discountAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sequence: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  reversedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  voucher: z.lazy(() => VoucherOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
});

export const VoucherDetailWhereUniqueInputSchema: z.ZodType<Prisma.VoucherDetailWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
  }),
  z.object({
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema),
  }),
  z.object({
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
  z.object({
    voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema),
  }),
  z.object({
    orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  voucherId_productId: z.lazy(() => VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema).optional(),
  voucherId_orderId: z.lazy(() => VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema).optional(),
  orderId_sequence: z.lazy(() => VoucherDetailOrderIdSequenceCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => VoucherDetailWhereInputSchema), z.lazy(() => VoucherDetailWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherDetailWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherDetailWhereInputSchema), z.lazy(() => VoucherDetailWhereInputSchema).array() ]).optional(),
  voucherId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  eligibleAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  discountAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  sequence: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  reversedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  voucher: z.union([ z.lazy(() => VoucherScalarRelationFilterSchema), z.lazy(() => VoucherWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  order: z.union([ z.lazy(() => OrderNullableScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional().nullable(),
}));

export const VoucherDetailOrderByWithAggregationInputSchema: z.ZodType<Prisma.VoucherDetailOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  voucherId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  orderId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  discountAmount: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sequence: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  reversedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => VoucherDetailCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => VoucherDetailAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VoucherDetailMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VoucherDetailMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => VoucherDetailSumOrderByAggregateInputSchema).optional(),
});

export const VoucherDetailScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VoucherDetailScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VoucherDetailScalarWhereWithAggregatesInputSchema), z.lazy(() => VoucherDetailScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherDetailScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherDetailScalarWhereWithAggregatesInputSchema), z.lazy(() => VoucherDetailScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  voucherId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => UuidNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  eligibleAmount: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  discountAmount: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  sequence: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  reversedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const CategoryWhereInputSchema: z.ZodType<Prisma.CategoryWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
});

export const CategoryOrderByWithRelationInputSchema: z.ZodType<Prisma.CategoryOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
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
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
}));

export const CategoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.CategoryOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductWhereInputSchema: z.ZodType<Prisma.ProductWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  vendor: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailListRelationFilterSchema).optional(),
});

export const ProductOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  category: z.lazy(() => CategoryOrderByWithRelationInputSchema).optional(),
  vendor: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  colors: z.lazy(() => ProductColorOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailOrderByRelationAggregateInputSchema).optional(),
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
  categoryId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category: z.union([ z.lazy(() => CategoryScalarRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  vendor: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailListRelationFilterSchema).optional(),
}));

export const ProductOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => UuidNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumProductStatusWithAggregatesFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductColorWhereInputSchema: z.ZodType<Prisma.ProductColorWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductColorWhereInputSchema), z.lazy(() => ProductColorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductColorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductColorWhereInputSchema), z.lazy(() => ProductColorWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrls: z.lazy(() => StringNullableListFilterSchema).optional(),
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
  imageUrls: z.lazy(() => SortOrderSchema).optional(),
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
  productId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrls: z.lazy(() => StringNullableListFilterSchema).optional(),
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
  imageUrls: z.lazy(() => SortOrderSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  imageUrls: z.lazy(() => StringNullableListFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductVariantWhereInputSchema: z.ZodType<Prisma.ProductVariantWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductVariantWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productColorId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  stock: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  size: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  productColor: z.union([ z.lazy(() => ProductColorScalarRelationFilterSchema), z.lazy(() => ProductColorWhereInputSchema) ]).optional(),
  cartItems: z.lazy(() => CartItemListRelationFilterSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailListRelationFilterSchema).optional(),
});

export const ProductVariantOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductVariantOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  size: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  productColor: z.lazy(() => ProductColorOrderByWithRelationInputSchema).optional(),
  cartItems: z.lazy(() => CartItemOrderByRelationAggregateInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailOrderByRelationAggregateInputSchema).optional(),
});

export const ProductVariantWhereUniqueInputSchema: z.ZodType<Prisma.ProductVariantWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductVariantWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductVariantWhereInputSchema), z.lazy(() => ProductVariantWhereInputSchema).array() ]).optional(),
  productColorId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  stock: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  size: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  productColor: z.union([ z.lazy(() => ProductColorScalarRelationFilterSchema), z.lazy(() => ProductColorWhereInputSchema) ]).optional(),
  cartItems: z.lazy(() => CartItemListRelationFilterSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailListRelationFilterSchema).optional(),
}));

export const ProductVariantOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductVariantOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  size: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  productColorId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  stock: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  size: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ReviewWhereInputSchema: z.ZodType<Prisma.ReviewWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderDetailId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  rating: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  orderDetail: z.union([ z.lazy(() => OrderDetailScalarRelationFilterSchema), z.lazy(() => OrderDetailWhereInputSchema) ]).optional(),
});

export const ReviewOrderByWithRelationInputSchema: z.ZodType<Prisma.ReviewOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderDetailId: z.lazy(() => SortOrderSchema).optional(),
  content: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  rating: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  orderDetail: z.lazy(() => OrderDetailOrderByWithRelationInputSchema).optional(),
});

export const ReviewWhereUniqueInputSchema: z.ZodType<Prisma.ReviewWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    orderDetailId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    orderDetailId: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  orderDetailId: z.string().optional(),
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema), z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  rating: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductScalarRelationFilterSchema), z.lazy(() => ProductWhereInputSchema) ]).optional(),
  orderDetail: z.union([ z.lazy(() => OrderDetailScalarRelationFilterSchema), z.lazy(() => OrderDetailWhereInputSchema) ]).optional(),
}));

export const ReviewOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReviewOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderDetailId: z.lazy(() => SortOrderSchema).optional(),
  content: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  rating: z.lazy(() => SortOrderSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  orderDetailId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  rating: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const CartWhereInputSchema: z.ZodType<Prisma.CartWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartWhereInputSchema), z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartWhereInputSchema), z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  items: z.lazy(() => CartItemListRelationFilterSchema).optional(),
});

export const CartOrderByWithRelationInputSchema: z.ZodType<Prisma.CartOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
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
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  items: z.lazy(() => CartItemListRelationFilterSchema).optional(),
}));

export const CartOrderByWithAggregationInputSchema: z.ZodType<Prisma.CartOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => CartCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CartMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CartMinOrderByAggregateInputSchema).optional(),
});

export const CartScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CartScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartScalarWhereWithAggregatesInputSchema), z.lazy(() => CartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartScalarWhereWithAggregatesInputSchema), z.lazy(() => CartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const CartItemWhereInputSchema: z.ZodType<Prisma.CartItemWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CartItemWhereInputSchema), z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartItemWhereInputSchema), z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
  cart: z.union([ z.lazy(() => CartScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional(),
});

export const CartItemOrderByWithRelationInputSchema: z.ZodType<Prisma.CartItemOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  productVariant: z.lazy(() => ProductVariantOrderByWithRelationInputSchema).optional(),
  cart: z.lazy(() => CartOrderByWithRelationInputSchema).optional(),
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
  productVariantId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
  cart: z.union([ z.lazy(() => CartScalarRelationFilterSchema), z.lazy(() => CartWhereInputSchema) ]).optional(),
}));

export const CartItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.CartItemOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const OrderWhereInputSchema: z.ZodType<Prisma.OrderWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderCode: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  subtotalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  discountAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  shippingFee: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  receiverName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  receiverPhone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  shippingAddress: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  details: z.lazy(() => OrderDetailListRelationFilterSchema).optional(),
  payment: z.union([ z.lazy(() => PaymentNullableScalarRelationFilterSchema), z.lazy(() => PaymentWhereInputSchema) ]).optional().nullable(),
  voucherDetails: z.lazy(() => VoucherDetailListRelationFilterSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryListRelationFilterSchema).optional(),
});

export const OrderOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  receiverName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  receiverPhone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  shippingAddress: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  details: z.lazy(() => OrderDetailOrderByRelationAggregateInputSchema).optional(),
  payment: z.lazy(() => PaymentOrderByWithRelationInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailOrderByRelationAggregateInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryOrderByRelationAggregateInputSchema).optional(),
});

export const OrderWhereUniqueInputSchema: z.ZodType<Prisma.OrderWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    orderCode: z.cuid(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    orderCode: z.cuid(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  AND: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  subtotalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  discountAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  shippingFee: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  receiverName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  receiverPhone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  shippingAddress: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  details: z.lazy(() => OrderDetailListRelationFilterSchema).optional(),
  payment: z.union([ z.lazy(() => PaymentNullableScalarRelationFilterSchema), z.lazy(() => PaymentWhereInputSchema) ]).optional().nullable(),
  voucherDetails: z.lazy(() => VoucherDetailListRelationFilterSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryListRelationFilterSchema).optional(),
}));

export const OrderOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  receiverName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  receiverPhone: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  shippingAddress: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  orderCode: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  subtotalAmount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  discountAmount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  shippingFee: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusWithAggregatesFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  receiverName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  receiverPhone: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  shippingAddress: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const OrderDetailWhereInputSchema: z.ZodType<Prisma.OrderDetailWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderDetailWhereInputSchema), z.lazy(() => OrderDetailWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderDetailWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderDetailWhereInputSchema), z.lazy(() => OrderDetailWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  productName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  colorName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  sizeName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
  review: z.union([ z.lazy(() => ReviewNullableScalarRelationFilterSchema), z.lazy(() => ReviewWhereInputSchema) ]).optional().nullable(),
});

export const OrderDetailOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderDetailOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  productName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  colorName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sizeName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantOrderByWithRelationInputSchema).optional(),
  review: z.lazy(() => ReviewOrderByWithRelationInputSchema).optional(),
});

export const OrderDetailWhereUniqueInputSchema: z.ZodType<Prisma.OrderDetailWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    orderId_productVariantId: z.lazy(() => OrderDetailOrderIdProductVariantIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    orderId_productVariantId: z.lazy(() => OrderDetailOrderIdProductVariantIdCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  orderId_productVariantId: z.lazy(() => OrderDetailOrderIdProductVariantIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => OrderDetailWhereInputSchema), z.lazy(() => OrderDetailWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderDetailWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderDetailWhereInputSchema), z.lazy(() => OrderDetailWhereInputSchema).array() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  productName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  colorName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  sizeName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
  productVariant: z.union([ z.lazy(() => ProductVariantScalarRelationFilterSchema), z.lazy(() => ProductVariantWhereInputSchema) ]).optional(),
  review: z.union([ z.lazy(() => ReviewNullableScalarRelationFilterSchema), z.lazy(() => ReviewWhereInputSchema) ]).optional().nullable(),
}));

export const OrderDetailOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderDetailOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  productName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  colorName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sizeName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => OrderDetailCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => OrderDetailAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderDetailMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderDetailMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => OrderDetailSumOrderByAggregateInputSchema).optional(),
});

export const OrderDetailScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderDetailScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderDetailScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderDetailScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderDetailScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderDetailScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderDetailScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  productName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  colorName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  sizeName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
});

export const PaymentWhereInputSchema: z.ZodType<Prisma.PaymentWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PaymentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  transactionCode: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  gateway: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  gatewayResponse: z.lazy(() => JsonNullableFilterSchema).optional(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  failedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
});

export const PaymentOrderByWithRelationInputSchema: z.ZodType<Prisma.PaymentOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  transactionCode: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  gateway: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  gatewayResponse: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  paidAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  failedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
});

export const PaymentWhereUniqueInputSchema: z.ZodType<Prisma.PaymentWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    orderId: z.string(),
    transactionCode: z.string(),
  }),
  z.object({
    id: z.uuid(),
    orderId: z.string(),
  }),
  z.object({
    id: z.uuid(),
    transactionCode: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    orderId: z.string(),
    transactionCode: z.string(),
  }),
  z.object({
    orderId: z.string(),
  }),
  z.object({
    transactionCode: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string().optional(),
  transactionCode: z.string().optional(),
  AND: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PaymentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PaymentWhereInputSchema), z.lazy(() => PaymentWhereInputSchema).array() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  gateway: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  gatewayResponse: z.lazy(() => JsonNullableFilterSchema).optional(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  failedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
}));

export const PaymentOrderByWithAggregationInputSchema: z.ZodType<Prisma.PaymentOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  transactionCode: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  gateway: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  gatewayResponse: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  paidAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  failedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  method: z.union([ z.lazy(() => EnumPaymentMethodWithAggregatesFilterSchema), z.lazy(() => PaymentMethodSchema) ]).optional(),
  amount: z.union([ z.lazy(() => DecimalWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumPaymentStatusWithAggregatesFilterSchema), z.lazy(() => PaymentStatusSchema) ]).optional(),
  transactionCode: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  gateway: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  gatewayResponse: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  paidAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  failedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const OrderStatusHistoryWhereInputSchema: z.ZodType<Prisma.OrderStatusHistoryWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema), z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema), z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => EnumOrderStatusNullableFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  note: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
  actor: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
});

export const OrderStatusHistoryOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderStatusHistoryOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  toStatus: z.lazy(() => SortOrderSchema).optional(),
  note: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
  actor: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const OrderStatusHistoryWhereUniqueInputSchema: z.ZodType<Prisma.OrderStatusHistoryWhereUniqueInput> = z.object({
  id: z.uuid(),
})
.and(z.strictObject({
  id: z.uuid().optional(),
  AND: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema), z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryWhereInputSchema), z.lazy(() => OrderStatusHistoryWhereInputSchema).array() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => EnumOrderStatusNullableFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  note: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  order: z.union([ z.lazy(() => OrderScalarRelationFilterSchema), z.lazy(() => OrderWhereInputSchema) ]).optional(),
  actor: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}));

export const OrderStatusHistoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrderStatusHistoryOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  toStatus: z.lazy(() => SortOrderSchema).optional(),
  note: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => OrderStatusHistoryCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => OrderStatusHistoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => OrderStatusHistoryMinOrderByAggregateInputSchema).optional(),
});

export const OrderStatusHistoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderStatusHistoryScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidWithAggregatesFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => UuidNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => EnumOrderStatusNullableWithAggregatesFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => EnumOrderStatusWithAggregatesFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  note: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherCreateInputSchema: z.ZodType<Prisma.VoucherCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutVouchersInputSchema),
  details: z.lazy(() => VoucherDetailCreateNestedManyWithoutVoucherInputSchema).optional(),
});

export const VoucherUncheckedCreateInputSchema: z.ZodType<Prisma.VoucherUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutVoucherInputSchema).optional(),
});

export const VoucherUpdateInputSchema: z.ZodType<Prisma.VoucherUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVouchersNestedInputSchema).optional(),
  details: z.lazy(() => VoucherDetailUpdateManyWithoutVoucherNestedInputSchema).optional(),
});

export const VoucherUncheckedUpdateInputSchema: z.ZodType<Prisma.VoucherUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutVoucherNestedInputSchema).optional(),
});

export const VoucherCreateManyInputSchema: z.ZodType<Prisma.VoucherCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const VoucherUpdateManyMutationInputSchema: z.ZodType<Prisma.VoucherUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VoucherUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailCreateInputSchema: z.ZodType<Prisma.VoucherDetailCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
  voucher: z.lazy(() => VoucherCreateNestedOneWithoutDetailsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutVoucherDetailsInputSchema).optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutVoucherDetailsInputSchema).optional(),
});

export const VoucherDetailUncheckedCreateInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  voucherId: z.string(),
  productId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailUpdateInputSchema: z.ZodType<Prisma.VoucherDetailUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  voucher: z.lazy(() => VoucherUpdateOneRequiredWithoutDetailsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutVoucherDetailsNestedInputSchema).optional(),
  order: z.lazy(() => OrderUpdateOneWithoutVoucherDetailsNestedInputSchema).optional(),
});

export const VoucherDetailUncheckedUpdateInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  voucherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailCreateManyInputSchema: z.ZodType<Prisma.VoucherDetailCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  voucherId: z.string(),
  productId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailUpdateManyMutationInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  voucherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CategoryCreateInputSchema: z.ZodType<Prisma.CategoryCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  products: z.lazy(() => ProductCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export const CategoryUncheckedCreateInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export const CategoryUpdateInputSchema: z.ZodType<Prisma.CategoryUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  products: z.lazy(() => ProductUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export const CategoryUncheckedUpdateInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export const CategoryCreateManyInputSchema: z.ZodType<Prisma.CategoryCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CategoryUpdateManyMutationInputSchema: z.ZodType<Prisma.CategoryUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CategoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
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
  vendor: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema).optional(),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateInputSchema: z.ZodType<Prisma.ProductUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
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
  vendor: z.lazy(() => UserUpdateOneWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductCreateManyInputSchema: z.ZodType<Prisma.ProductCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
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
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductColorCreateInputSchema: z.ZodType<Prisma.ProductColorCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
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
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedCreateNestedManyWithoutProductColorInputSchema).optional(),
});

export const ProductColorUpdateInputSchema: z.ZodType<Prisma.ProductColorUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
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
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorCreateManyInputSchema: z.ZodType<Prisma.ProductColorCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductColorUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductColorUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductColorUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductVariantCreateInputSchema: z.ZodType<Prisma.ProductVariantCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  productColor: z.lazy(() => ProductColorCreateNestedOneWithoutVariantsInputSchema),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUpdateInputSchema: z.ZodType<Prisma.ProductVariantUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productColor: z.lazy(() => ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantCreateManyInputSchema: z.ZodType<Prisma.ProductVariantCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductVariantUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductVariantUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductVariantUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewCreateInputSchema: z.ZodType<Prisma.ReviewCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
  orderDetail: z.lazy(() => OrderDetailCreateNestedOneWithoutReviewInputSchema),
});

export const ReviewUncheckedCreateInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  productId: z.string(),
  orderDetailId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewUpdateInputSchema: z.ZodType<Prisma.ReviewUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  orderDetail: z.lazy(() => OrderDetailUpdateOneRequiredWithoutReviewNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDetailId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewCreateManyInputSchema: z.ZodType<Prisma.ReviewCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  productId: z.string(),
  orderDetailId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewUpdateManyMutationInputSchema: z.ZodType<Prisma.ReviewUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDetailId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CartCreateInputSchema: z.ZodType<Prisma.CartCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutCartInputSchema),
  items: z.lazy(() => CartItemCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartUncheckedCreateInputSchema: z.ZodType<Prisma.CartUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartUpdateInputSchema: z.ZodType<Prisma.CartUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCartNestedInputSchema).optional(),
  items: z.lazy(() => CartItemUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const CartUncheckedUpdateInputSchema: z.ZodType<Prisma.CartUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  items: z.lazy(() => CartItemUncheckedUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const CartCreateManyInputSchema: z.ZodType<Prisma.CartCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CartUpdateManyMutationInputSchema: z.ZodType<Prisma.CartUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CartUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CartUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CartItemCreateInputSchema: z.ZodType<Prisma.CartItemCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutCartItemsInputSchema),
  cart: z.lazy(() => CartCreateNestedOneWithoutItemsInputSchema),
});

export const CartItemUncheckedCreateInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string(),
  cartId: z.string(),
  quantity: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const CartItemUpdateInputSchema: z.ZodType<Prisma.CartItemUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneRequiredWithoutCartItemsNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
});

export const CartItemUncheckedUpdateInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cartId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CartItemCreateManyInputSchema: z.ZodType<Prisma.CartItemCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string(),
  cartId: z.string(),
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
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  cartId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderCreateInputSchema: z.ZodType<Prisma.OrderCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  details: z.lazy(() => OrderDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateInputSchema: z.ZodType<Prisma.OrderUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  userId: z.string(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUpdateInputSchema: z.ZodType<Prisma.OrderUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  details: z.lazy(() => OrderDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderCreateManyInputSchema: z.ZodType<Prisma.OrderCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  userId: z.string(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const OrderUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderDetailCreateInputSchema: z.ZodType<Prisma.OrderDetailCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  order: z.lazy(() => OrderCreateNestedOneWithoutDetailsInputSchema),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutOrderDetailsInputSchema),
  review: z.lazy(() => ReviewCreateNestedOneWithoutOrderDetailInputSchema).optional(),
});

export const OrderDetailUncheckedCreateInputSchema: z.ZodType<Prisma.OrderDetailUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  review: z.lazy(() => ReviewUncheckedCreateNestedOneWithoutOrderDetailInputSchema).optional(),
});

export const OrderDetailUpdateInputSchema: z.ZodType<Prisma.OrderDetailUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutDetailsNestedInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneRequiredWithoutOrderDetailsNestedInputSchema).optional(),
  review: z.lazy(() => ReviewUpdateOneWithoutOrderDetailNestedInputSchema).optional(),
});

export const OrderDetailUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  review: z.lazy(() => ReviewUncheckedUpdateOneWithoutOrderDetailNestedInputSchema).optional(),
});

export const OrderDetailCreateManyInputSchema: z.ZodType<Prisma.OrderDetailCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export const OrderDetailUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderDetailUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderDetailUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PaymentCreateInputSchema: z.ZodType<Prisma.PaymentCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  transactionCode: z.string().optional().nullable(),
  gateway: z.string().optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutPaymentInputSchema),
});

export const PaymentUncheckedCreateInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  method: z.lazy(() => PaymentMethodSchema),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  transactionCode: z.string().optional().nullable(),
  gateway: z.string().optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const PaymentUpdateInputSchema: z.ZodType<Prisma.PaymentUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  transactionCode: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gateway: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  failedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutPaymentNestedInputSchema).optional(),
});

export const PaymentUncheckedUpdateInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  transactionCode: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gateway: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  failedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PaymentCreateManyInputSchema: z.ZodType<Prisma.PaymentCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  method: z.lazy(() => PaymentMethodSchema),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  transactionCode: z.string().optional().nullable(),
  gateway: z.string().optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const PaymentUpdateManyMutationInputSchema: z.ZodType<Prisma.PaymentUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  transactionCode: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gateway: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  failedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PaymentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  transactionCode: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gateway: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  failedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderStatusHistoryCreateInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutStatusHistoryInputSchema),
  actor: z.lazy(() => UserCreateNestedOneWithoutOrderStatusHistoriesInputSchema).optional(),
});

export const OrderStatusHistoryUncheckedCreateInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  actorId: z.string().optional().nullable(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const OrderStatusHistoryUpdateInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutStatusHistoryNestedInputSchema).optional(),
  actor: z.lazy(() => UserUpdateOneWithoutOrderStatusHistoriesNestedInputSchema).optional(),
});

export const OrderStatusHistoryUncheckedUpdateInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderStatusHistoryCreateManyInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  actorId: z.string().optional().nullable(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const OrderStatusHistoryUpdateManyMutationInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderStatusHistoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UuidFilterSchema: z.ZodType<Prisma.UuidFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
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

export const EnumUserRoleFilterSchema: z.ZodType<Prisma.EnumUserRoleFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
});

export const EnumUserStatusFilterSchema: z.ZodType<Prisma.EnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
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

export const VoucherListRelationFilterSchema: z.ZodType<Prisma.VoucherListRelationFilter> = z.strictObject({
  every: z.lazy(() => VoucherWhereInputSchema).optional(),
  some: z.lazy(() => VoucherWhereInputSchema).optional(),
  none: z.lazy(() => VoucherWhereInputSchema).optional(),
});

export const ReviewListRelationFilterSchema: z.ZodType<Prisma.ReviewListRelationFilter> = z.strictObject({
  every: z.lazy(() => ReviewWhereInputSchema).optional(),
  some: z.lazy(() => ReviewWhereInputSchema).optional(),
  none: z.lazy(() => ReviewWhereInputSchema).optional(),
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

export const ProductListRelationFilterSchema: z.ZodType<Prisma.ProductListRelationFilter> = z.strictObject({
  every: z.lazy(() => ProductWhereInputSchema).optional(),
  some: z.lazy(() => ProductWhereInputSchema).optional(),
  none: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const OrderStatusHistoryListRelationFilterSchema: z.ZodType<Prisma.OrderStatusHistoryListRelationFilter> = z.strictObject({
  every: z.lazy(() => OrderStatusHistoryWhereInputSchema).optional(),
  some: z.lazy(() => OrderStatusHistoryWhereInputSchema).optional(),
  none: z.lazy(() => OrderStatusHistoryWhereInputSchema).optional(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const VoucherOrderByRelationAggregateInputSchema: z.ZodType<Prisma.VoucherOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReviewOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderStatusHistoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  fullName: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  phone: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional(),
});

export const UuidWithAggregatesFilterSchema: z.ZodType<Prisma.UuidWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
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

export const EnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
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

export const EnumVoucherScopeFilterSchema: z.ZodType<Prisma.EnumVoucherScopeFilter> = z.strictObject({
  equals: z.lazy(() => VoucherScopeSchema).optional(),
  in: z.lazy(() => VoucherScopeSchema).array().optional(),
  notIn: z.lazy(() => VoucherScopeSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => NestedEnumVoucherScopeFilterSchema) ]).optional(),
});

export const EnumDiscountTypeFilterSchema: z.ZodType<Prisma.EnumDiscountTypeFilter> = z.strictObject({
  equals: z.lazy(() => DiscountTypeSchema).optional(),
  in: z.lazy(() => DiscountTypeSchema).array().optional(),
  notIn: z.lazy(() => DiscountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => NestedEnumDiscountTypeFilterSchema) ]).optional(),
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

export const EnumVoucherStatusFilterSchema: z.ZodType<Prisma.EnumVoucherStatusFilter> = z.strictObject({
  equals: z.lazy(() => VoucherStatusSchema).optional(),
  in: z.lazy(() => VoucherStatusSchema).array().optional(),
  notIn: z.lazy(() => VoucherStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => NestedEnumVoucherStatusFilterSchema) ]).optional(),
});

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional(),
});

export const VoucherDetailListRelationFilterSchema: z.ZodType<Prisma.VoucherDetailListRelationFilter> = z.strictObject({
  every: z.lazy(() => VoucherDetailWhereInputSchema).optional(),
  some: z.lazy(() => VoucherDetailWhereInputSchema).optional(),
  none: z.lazy(() => VoucherDetailWhereInputSchema).optional(),
});

export const VoucherDetailOrderByRelationAggregateInputSchema: z.ZodType<Prisma.VoucherDetailOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherCountOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  discountType: z.lazy(() => SortOrderSchema).optional(),
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.lazy(() => SortOrderSchema).optional(),
  maxDiscountAmount: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherAvgOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherAvgOrderByAggregateInput> = z.strictObject({
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.lazy(() => SortOrderSchema).optional(),
  maxDiscountAmount: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  discountType: z.lazy(() => SortOrderSchema).optional(),
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.lazy(() => SortOrderSchema).optional(),
  maxDiscountAmount: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherMinOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  scope: z.lazy(() => SortOrderSchema).optional(),
  discountType: z.lazy(() => SortOrderSchema).optional(),
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.lazy(() => SortOrderSchema).optional(),
  maxDiscountAmount: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
  startDate: z.lazy(() => SortOrderSchema).optional(),
  endDate: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherSumOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherSumOrderByAggregateInput> = z.strictObject({
  discountValue: z.lazy(() => SortOrderSchema).optional(),
  minOrderAmount: z.lazy(() => SortOrderSchema).optional(),
  maxDiscountAmount: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  usedQuantity: z.lazy(() => SortOrderSchema).optional(),
  perUserLimit: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumVoucherScopeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumVoucherScopeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => VoucherScopeSchema).optional(),
  in: z.lazy(() => VoucherScopeSchema).array().optional(),
  notIn: z.lazy(() => VoucherScopeSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => NestedEnumVoucherScopeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVoucherScopeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVoucherScopeFilterSchema).optional(),
});

export const EnumDiscountTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumDiscountTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => DiscountTypeSchema).optional(),
  in: z.lazy(() => DiscountTypeSchema).array().optional(),
  notIn: z.lazy(() => DiscountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => NestedEnumDiscountTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumDiscountTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumDiscountTypeFilterSchema).optional(),
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

export const EnumVoucherStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumVoucherStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => VoucherStatusSchema).optional(),
  in: z.lazy(() => VoucherStatusSchema).array().optional(),
  notIn: z.lazy(() => VoucherStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => NestedEnumVoucherStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVoucherStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVoucherStatusFilterSchema).optional(),
});

export const UuidNullableFilterSchema: z.ZodType<Prisma.UuidNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidNullableFilterSchema) ]).optional().nullable(),
});

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const VoucherScalarRelationFilterSchema: z.ZodType<Prisma.VoucherScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => VoucherWhereInputSchema).optional(),
  isNot: z.lazy(() => VoucherWhereInputSchema).optional(),
});

export const ProductNullableScalarRelationFilterSchema: z.ZodType<Prisma.ProductNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ProductWhereInputSchema).optional().nullable(),
});

export const OrderNullableScalarRelationFilterSchema: z.ZodType<Prisma.OrderNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => OrderWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => OrderWhereInputSchema).optional().nullable(),
});

export const VoucherDetailVoucherIdProductIdCompoundUniqueInputSchema: z.ZodType<Prisma.VoucherDetailVoucherIdProductIdCompoundUniqueInput> = z.strictObject({
  voucherId: z.string(),
  productId: z.string(),
});

export const VoucherDetailVoucherIdOrderIdCompoundUniqueInputSchema: z.ZodType<Prisma.VoucherDetailVoucherIdOrderIdCompoundUniqueInput> = z.strictObject({
  voucherId: z.string(),
  orderId: z.string(),
});

export const VoucherDetailOrderIdSequenceCompoundUniqueInputSchema: z.ZodType<Prisma.VoucherDetailOrderIdSequenceCompoundUniqueInput> = z.strictObject({
  orderId: z.string(),
  sequence: z.number(),
});

export const VoucherDetailCountOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherDetailCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  voucherId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  eligibleAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  sequence: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  reversedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherDetailAvgOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherDetailAvgOrderByAggregateInput> = z.strictObject({
  eligibleAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  sequence: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherDetailMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherDetailMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  voucherId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  eligibleAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  sequence: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  reversedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherDetailMinOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherDetailMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  voucherId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  eligibleAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  sequence: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  reversedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const VoucherDetailSumOrderByAggregateInputSchema: z.ZodType<Prisma.VoucherDetailSumOrderByAggregateInput> = z.strictObject({
  eligibleAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  sequence: z.lazy(() => SortOrderSchema).optional(),
});

export const UuidNullableWithAggregatesFilterSchema: z.ZodType<Prisma.UuidNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
});

export const CategoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
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

export const UserNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable(),
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
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  vendorId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
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

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.strictObject({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional(),
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
  imageUrls: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductColorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductColorMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductColorMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductColorMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
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

export const OrderDetailListRelationFilterSchema: z.ZodType<Prisma.OrderDetailListRelationFilter> = z.strictObject({
  every: z.lazy(() => OrderDetailWhereInputSchema).optional(),
  some: z.lazy(() => OrderDetailWhereInputSchema).optional(),
  none: z.lazy(() => OrderDetailWhereInputSchema).optional(),
});

export const CartItemOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CartItemOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderDetailOrderByRelationAggregateInputSchema: z.ZodType<Prisma.OrderDetailOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  size: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantAvgOrderByAggregateInput> = z.strictObject({
  stock: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  size: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productColorId: z.lazy(() => SortOrderSchema).optional(),
  stock: z.lazy(() => SortOrderSchema).optional(),
  size: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantSumOrderByAggregateInputSchema: z.ZodType<Prisma.ProductVariantSumOrderByAggregateInput> = z.strictObject({
  stock: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderDetailScalarRelationFilterSchema: z.ZodType<Prisma.OrderDetailScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => OrderDetailWhereInputSchema).optional(),
  isNot: z.lazy(() => OrderDetailWhereInputSchema).optional(),
});

export const ReviewCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderDetailId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  rating: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewAvgOrderByAggregateInput> = z.strictObject({
  rating: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderDetailId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  rating: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  orderDetailId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  rating: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ReviewSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewSumOrderByAggregateInput> = z.strictObject({
  rating: z.lazy(() => SortOrderSchema).optional(),
});

export const CartCountOrderByAggregateInputSchema: z.ZodType<Prisma.CartCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CartMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartMinOrderByAggregateInputSchema: z.ZodType<Prisma.CartMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const ProductVariantScalarRelationFilterSchema: z.ZodType<Prisma.ProductVariantScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductVariantWhereInputSchema).optional(),
});

export const CartScalarRelationFilterSchema: z.ZodType<Prisma.CartScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CartWhereInputSchema).optional(),
  isNot: z.lazy(() => CartWhereInputSchema).optional(),
});

export const CartItemCartIdProductVariantIdCompoundUniqueInputSchema: z.ZodType<Prisma.CartItemCartIdProductVariantIdCompoundUniqueInput> = z.strictObject({
  cartId: z.string(),
  productVariantId: z.string(),
});

export const CartItemCountOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemAvgOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const CartItemMinOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  cartId: z.lazy(() => SortOrderSchema).optional(),
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

export const PaymentNullableScalarRelationFilterSchema: z.ZodType<Prisma.PaymentNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => PaymentWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => PaymentWhereInputSchema).optional().nullable(),
});

export const OrderCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  receiverName: z.lazy(() => SortOrderSchema).optional(),
  receiverPhone: z.lazy(() => SortOrderSchema).optional(),
  shippingAddress: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderAvgOrderByAggregateInput> = z.strictObject({
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  receiverName: z.lazy(() => SortOrderSchema).optional(),
  receiverPhone: z.lazy(() => SortOrderSchema).optional(),
  shippingAddress: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderCode: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
  totalAmount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional(),
  receiverName: z.lazy(() => SortOrderSchema).optional(),
  receiverPhone: z.lazy(() => SortOrderSchema).optional(),
  shippingAddress: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  cancelledAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderSumOrderByAggregateInputSchema: z.ZodType<Prisma.OrderSumOrderByAggregateInput> = z.strictObject({
  subtotalAmount: z.lazy(() => SortOrderSchema).optional(),
  discountAmount: z.lazy(() => SortOrderSchema).optional(),
  shippingFee: z.lazy(() => SortOrderSchema).optional(),
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

export const ReviewNullableScalarRelationFilterSchema: z.ZodType<Prisma.ReviewNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => ReviewWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ReviewWhereInputSchema).optional().nullable(),
});

export const OrderDetailOrderIdProductVariantIdCompoundUniqueInputSchema: z.ZodType<Prisma.OrderDetailOrderIdProductVariantIdCompoundUniqueInput> = z.strictObject({
  orderId: z.string(),
  productVariantId: z.string(),
});

export const OrderDetailCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderDetailCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  colorName: z.lazy(() => SortOrderSchema).optional(),
  sizeName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderDetailAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderDetailAvgOrderByAggregateInput> = z.strictObject({
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderDetailMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderDetailMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  colorName: z.lazy(() => SortOrderSchema).optional(),
  sizeName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderDetailMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderDetailMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  productVariantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  productName: z.lazy(() => SortOrderSchema).optional(),
  colorName: z.lazy(() => SortOrderSchema).optional(),
  sizeName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderDetailSumOrderByAggregateInputSchema: z.ZodType<Prisma.OrderDetailSumOrderByAggregateInput> = z.strictObject({
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

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const PaymentCountOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  transactionCode: z.lazy(() => SortOrderSchema).optional(),
  gateway: z.lazy(() => SortOrderSchema).optional(),
  gatewayResponse: z.lazy(() => SortOrderSchema).optional(),
  paidAt: z.lazy(() => SortOrderSchema).optional(),
  failedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentAvgOrderByAggregateInput> = z.strictObject({
  amount: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  transactionCode: z.lazy(() => SortOrderSchema).optional(),
  gateway: z.lazy(() => SortOrderSchema).optional(),
  paidAt: z.lazy(() => SortOrderSchema).optional(),
  failedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
});

export const PaymentMinOrderByAggregateInputSchema: z.ZodType<Prisma.PaymentMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  method: z.lazy(() => SortOrderSchema).optional(),
  amount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  transactionCode: z.lazy(() => SortOrderSchema).optional(),
  gateway: z.lazy(() => SortOrderSchema).optional(),
  paidAt: z.lazy(() => SortOrderSchema).optional(),
  failedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
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

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
});

export const EnumOrderStatusNullableFilterSchema: z.ZodType<Prisma.EnumOrderStatusNullableFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusNullableFilterSchema) ]).optional().nullable(),
});

export const OrderStatusHistoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  fromStatus: z.lazy(() => SortOrderSchema).optional(),
  toStatus: z.lazy(() => SortOrderSchema).optional(),
  note: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderStatusHistoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  fromStatus: z.lazy(() => SortOrderSchema).optional(),
  toStatus: z.lazy(() => SortOrderSchema).optional(),
  note: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const OrderStatusHistoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.OrderStatusHistoryMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  orderId: z.lazy(() => SortOrderSchema).optional(),
  actorId: z.lazy(() => SortOrderSchema).optional(),
  fromStatus: z.lazy(() => SortOrderSchema).optional(),
  toStatus: z.lazy(() => SortOrderSchema).optional(),
  note: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export const EnumOrderStatusNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumOrderStatusNullableWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional(),
});

export const VoucherCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.VoucherCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherCreateWithoutUserInputSchema), z.lazy(() => VoucherCreateWithoutUserInputSchema).array(), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema), z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
});

export const ReviewCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewCreateWithoutUserInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
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

export const ProductCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryCreateNestedManyWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateNestedManyWithoutActorInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyActorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
});

export const VoucherUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.VoucherUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherCreateWithoutUserInputSchema), z.lazy(() => VoucherCreateWithoutUserInputSchema).array(), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema), z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
});

export const ReviewUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutUserInputSchema), z.lazy(() => ReviewCreateWithoutUserInputSchema).array(), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema), z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema), z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
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

export const ProductUncheckedCreateNestedManyWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutVendorInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyActorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional().nullable(),
});

export const EnumUserRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserRoleFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => UserRoleSchema).optional(),
});

export const EnumUserStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => UserStatusSchema).optional(),
});

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional(),
});

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional().nullable(),
});

export const VoucherUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.VoucherUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherCreateWithoutUserInputSchema), z.lazy(() => VoucherCreateWithoutUserInputSchema).array(), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema), z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VoucherUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VoucherUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => VoucherUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherScalarWhereInputSchema), z.lazy(() => VoucherScalarWhereInputSchema).array() ]).optional(),
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

export const ProductUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyWithoutActorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyActorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutActorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
});

export const VoucherUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.VoucherUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherCreateWithoutUserInputSchema), z.lazy(() => VoucherCreateWithoutUserInputSchema).array(), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema), z.lazy(() => VoucherCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VoucherUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherWhereUniqueInputSchema), z.lazy(() => VoucherWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => VoucherUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => VoucherUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherScalarWhereInputSchema), z.lazy(() => VoucherScalarWhereInputSchema).array() ]).optional(),
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

export const ProductUncheckedUpdateManyWithoutVendorNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutVendorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductCreateWithoutVendorInputSchema).array(), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema), z.lazy(() => ProductCreateOrConnectWithoutVendorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpsertWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyVendorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema), z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema), z.lazy(() => ProductUpdateWithWhereUniqueWithoutVendorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema), z.lazy(() => ProductUpdateManyWithWhereWithoutVendorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutActorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyActorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutActorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutActorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
});

export const UserCreateNestedOneWithoutVouchersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutVouchersInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVouchersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVouchersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const VoucherDetailCreateNestedManyWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailCreateNestedManyWithoutVoucherInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyVoucherInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const VoucherDetailUncheckedCreateNestedManyWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateNestedManyWithoutVoucherInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyVoucherInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const EnumVoucherScopeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumVoucherScopeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => VoucherScopeSchema).optional(),
});

export const EnumDiscountTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumDiscountTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => DiscountTypeSchema).optional(),
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

export const EnumVoucherStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumVoucherStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => VoucherStatusSchema).optional(),
});

export const UserUpdateOneRequiredWithoutVouchersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutVouchersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVouchersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutVouchersInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutVouchersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutVouchersInputSchema), z.lazy(() => UserUpdateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVouchersInputSchema) ]).optional(),
});

export const VoucherDetailUpdateManyWithoutVoucherNestedInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyWithoutVoucherNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutVoucherInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyVoucherInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutVoucherInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutVoucherInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
});

export const VoucherDetailUncheckedUpdateManyWithoutVoucherNestedInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyWithoutVoucherNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutVoucherInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutVoucherInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyVoucherInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutVoucherInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutVoucherInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
});

export const VoucherCreateNestedOneWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherCreateNestedOneWithoutDetailsInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherCreateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VoucherCreateOrConnectWithoutDetailsInputSchema).optional(),
  connect: z.lazy(() => VoucherWhereUniqueInputSchema).optional(),
});

export const ProductCreateNestedOneWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutVoucherDetailsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVoucherDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutVoucherDetailsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
});

export const OrderCreateNestedOneWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutVoucherDetailsInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutVoucherDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutVoucherDetailsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
});

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const VoucherUpdateOneRequiredWithoutDetailsNestedInputSchema: z.ZodType<Prisma.VoucherUpdateOneRequiredWithoutDetailsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherCreateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => VoucherCreateOrConnectWithoutDetailsInputSchema).optional(),
  upsert: z.lazy(() => VoucherUpsertWithoutDetailsInputSchema).optional(),
  connect: z.lazy(() => VoucherWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => VoucherUpdateToOneWithWhereWithoutDetailsInputSchema), z.lazy(() => VoucherUpdateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedUpdateWithoutDetailsInputSchema) ]).optional(),
});

export const ProductUpdateOneWithoutVoucherDetailsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutVoucherDetailsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductCreateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVoucherDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutVoucherDetailsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutVoucherDetailsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUpdateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVoucherDetailsInputSchema) ]).optional(),
});

export const OrderUpdateOneWithoutVoucherDetailsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneWithoutVoucherDetailsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutVoucherDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutVoucherDetailsInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutVoucherDetailsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => OrderWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => OrderWhereInputSchema) ]).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUpdateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutVoucherDetailsInputSchema) ]).optional(),
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

export const VoucherDetailCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateWithoutProductInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
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

export const VoucherDetailUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateNestedManyWithoutProductInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateWithoutProductInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
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

export const UserUpdateOneWithoutProductsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutProductsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutProductsInputSchema), z.lazy(() => UserUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutProductsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutProductsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
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

export const VoucherDetailUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateWithoutProductInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
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

export const VoucherDetailUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyWithoutProductNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateWithoutProductInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutProductInputSchema), z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutProductInputSchema), z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutProductInputSchema), z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
});

export const ProductColorCreateimageUrlsInputSchema: z.ZodType<Prisma.ProductColorCreateimageUrlsInput> = z.strictObject({
  set: z.string().array(),
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

export const ProductColorUpdateimageUrlsInputSchema: z.ZodType<Prisma.ProductColorUpdateimageUrlsInput> = z.strictObject({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
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

export const OrderDetailCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateWithoutProductVariantInputSchema).array(), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => CartItemUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => CartItemCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema), z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderDetailUncheckedCreateNestedManyWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUncheckedCreateNestedManyWithoutProductVariantInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyProductVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
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

export const OrderDetailUpdateManyWithoutProductVariantNestedInputSchema: z.ZodType<Prisma.OrderDetailUpdateManyWithoutProductVariantNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyProductVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderDetailUpdateManyWithWhereWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUpdateManyWithWhereWithoutProductVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderDetailScalarWhereInputSchema), z.lazy(() => OrderDetailScalarWhereInputSchema).array() ]).optional(),
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

export const OrderDetailUncheckedUpdateManyWithoutProductVariantNestedInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateManyWithoutProductVariantNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutProductVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyProductVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutProductVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderDetailUpdateManyWithWhereWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUpdateManyWithWhereWithoutProductVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderDetailScalarWhereInputSchema), z.lazy(() => OrderDetailScalarWhereInputSchema).array() ]).optional(),
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

export const OrderDetailCreateNestedOneWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailCreateNestedOneWithoutReviewInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutReviewInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderDetailCreateOrConnectWithoutReviewInputSchema).optional(),
  connect: z.lazy(() => OrderDetailWhereUniqueInputSchema).optional(),
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

export const OrderDetailUpdateOneRequiredWithoutReviewNestedInputSchema: z.ZodType<Prisma.OrderDetailUpdateOneRequiredWithoutReviewNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutReviewInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderDetailCreateOrConnectWithoutReviewInputSchema).optional(),
  upsert: z.lazy(() => OrderDetailUpsertWithoutReviewInputSchema).optional(),
  connect: z.lazy(() => OrderDetailWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderDetailUpdateToOneWithWhereWithoutReviewInputSchema), z.lazy(() => OrderDetailUpdateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutReviewInputSchema) ]).optional(),
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

export const ProductVariantCreateNestedOneWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateNestedOneWithoutCartItemsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutCartItemsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
});

export const CartCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateNestedOneWithoutItemsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
});

export const ProductVariantUpdateOneRequiredWithoutCartItemsNestedInputSchema: z.ZodType<Prisma.ProductVariantUpdateOneRequiredWithoutCartItemsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutCartItemsInputSchema).optional(),
  upsert: z.lazy(() => ProductVariantUpsertWithoutCartItemsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductVariantUpdateToOneWithWhereWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUpdateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutCartItemsInputSchema) ]).optional(),
});

export const CartUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.CartUpdateOneRequiredWithoutItemsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutItemsInputSchema).optional(),
  upsert: z.lazy(() => CartUpsertWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CartUpdateToOneWithWhereWithoutItemsInputSchema), z.lazy(() => CartUpdateWithoutItemsInputSchema), z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema) ]).optional(),
});

export const UserCreateNestedOneWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutOrdersInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrdersInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const OrderDetailCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const PaymentCreateNestedOneWithoutOrderInputSchema: z.ZodType<Prisma.PaymentCreateNestedOneWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).optional(),
  connect: z.lazy(() => PaymentWhereUniqueInputSchema).optional(),
});

export const VoucherDetailCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderDetailUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUncheckedCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const PaymentUncheckedCreateNestedOneWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateNestedOneWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).optional(),
  connect: z.lazy(() => PaymentWhereUniqueInputSchema).optional(),
});

export const VoucherDetailUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
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

export const OrderDetailUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderDetailUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderDetailUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => OrderDetailUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderDetailScalarWhereInputSchema), z.lazy(() => OrderDetailScalarWhereInputSchema).array() ]).optional(),
});

export const PaymentUpdateOneWithoutOrderNestedInputSchema: z.ZodType<Prisma.PaymentUpdateOneWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).optional(),
  upsert: z.lazy(() => PaymentUpsertWithoutOrderInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => PaymentWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => PaymentWhereInputSchema) ]).optional(),
  connect: z.lazy(() => PaymentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PaymentUpdateToOneWithWhereWithoutOrderInputSchema), z.lazy(() => PaymentUpdateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedUpdateWithoutOrderInputSchema) ]).optional(),
});

export const VoucherDetailUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
});

export const OrderDetailUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderDetailUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderDetailCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderDetailWhereUniqueInputSchema), z.lazy(() => OrderDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderDetailUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderDetailUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => OrderDetailUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderDetailScalarWhereInputSchema), z.lazy(() => OrderDetailScalarWhereInputSchema).array() ]).optional(),
});

export const PaymentUncheckedUpdateOneWithoutOrderNestedInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateOneWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PaymentCreateOrConnectWithoutOrderInputSchema).optional(),
  upsert: z.lazy(() => PaymentUpsertWithoutOrderInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => PaymentWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => PaymentWhereInputSchema) ]).optional(),
  connect: z.lazy(() => PaymentWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PaymentUpdateToOneWithWhereWithoutOrderInputSchema), z.lazy(() => PaymentUpdateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedUpdateWithoutOrderInputSchema) ]).optional(),
});

export const VoucherDetailUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema).array(), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema), z.lazy(() => VoucherDetailCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => VoucherDetailUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoucherDetailCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoucherDetailWhereUniqueInputSchema), z.lazy(() => VoucherDetailWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => VoucherDetailUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => VoucherDetailUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
});

export const OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema).array(), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderStatusHistoryCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema), z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
});

export const OrderCreateNestedOneWithoutDetailsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutDetailsInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutDetailsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
});

export const ProductVariantCreateNestedOneWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantCreateNestedOneWithoutOrderDetailsInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutOrderDetailsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
});

export const ReviewCreateNestedOneWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewCreateNestedOneWithoutOrderDetailInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutOrderDetailInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutOrderDetailInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
});

export const ReviewUncheckedCreateNestedOneWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedOneWithoutOrderDetailInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutOrderDetailInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutOrderDetailInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
});

export const OrderUpdateOneRequiredWithoutDetailsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutDetailsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutDetailsInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutDetailsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutDetailsInputSchema), z.lazy(() => OrderUpdateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutDetailsInputSchema) ]).optional(),
});

export const ProductVariantUpdateOneRequiredWithoutOrderDetailsNestedInputSchema: z.ZodType<Prisma.ProductVariantUpdateOneRequiredWithoutOrderDetailsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderDetailsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductVariantCreateOrConnectWithoutOrderDetailsInputSchema).optional(),
  upsert: z.lazy(() => ProductVariantUpsertWithoutOrderDetailsInputSchema).optional(),
  connect: z.lazy(() => ProductVariantWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductVariantUpdateToOneWithWhereWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUpdateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutOrderDetailsInputSchema) ]).optional(),
});

export const ReviewUpdateOneWithoutOrderDetailNestedInputSchema: z.ZodType<Prisma.ReviewUpdateOneWithoutOrderDetailNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutOrderDetailInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutOrderDetailInputSchema).optional(),
  upsert: z.lazy(() => ReviewUpsertWithoutOrderDetailInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateToOneWithWhereWithoutOrderDetailInputSchema), z.lazy(() => ReviewUpdateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutOrderDetailInputSchema) ]).optional(),
});

export const ReviewUncheckedUpdateOneWithoutOrderDetailNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateOneWithoutOrderDetailNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => ReviewCreateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutOrderDetailInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutOrderDetailInputSchema).optional(),
  upsert: z.lazy(() => ReviewUpsertWithoutOrderDetailInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateToOneWithWhereWithoutOrderDetailInputSchema), z.lazy(() => ReviewUpdateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutOrderDetailInputSchema) ]).optional(),
});

export const OrderCreateNestedOneWithoutPaymentInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutPaymentInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutPaymentInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
});

export const EnumPaymentMethodFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentMethodFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => PaymentMethodSchema).optional(),
});

export const EnumPaymentStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPaymentStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => PaymentStatusSchema).optional(),
});

export const OrderUpdateOneRequiredWithoutPaymentNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutPaymentNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutPaymentInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutPaymentInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutPaymentInputSchema), z.lazy(() => OrderUpdateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutPaymentInputSchema) ]).optional(),
});

export const OrderCreateNestedOneWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutStatusHistoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedCreateWithoutStatusHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutStatusHistoryInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
});

export const UserCreateNestedOneWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutOrderStatusHistoriesInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrderStatusHistoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrderStatusHistoriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const NullableEnumOrderStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumOrderStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => OrderStatusSchema).optional().nullable(),
});

export const OrderUpdateOneRequiredWithoutStatusHistoryNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutStatusHistoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => OrderCreateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedCreateWithoutStatusHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutStatusHistoryInputSchema).optional(),
  upsert: z.lazy(() => OrderUpsertWithoutStatusHistoryInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrderUpdateToOneWithWhereWithoutStatusHistoryInputSchema), z.lazy(() => OrderUpdateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutStatusHistoryInputSchema) ]).optional(),
});

export const UserUpdateOneWithoutOrderStatusHistoriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutOrderStatusHistoriesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrderStatusHistoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrderStatusHistoriesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutOrderStatusHistoriesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUpdateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutOrderStatusHistoriesInputSchema) ]).optional(),
});

export const NestedUuidFilterSchema: z.ZodType<Prisma.NestedUuidFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidFilterSchema) ]).optional(),
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

export const NestedEnumUserRoleFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
});

export const NestedEnumUserStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
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

export const NestedUuidWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidWithAggregatesFilterSchema) ]).optional(),
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

export const NestedEnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
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

export const NestedEnumVoucherScopeFilterSchema: z.ZodType<Prisma.NestedEnumVoucherScopeFilter> = z.strictObject({
  equals: z.lazy(() => VoucherScopeSchema).optional(),
  in: z.lazy(() => VoucherScopeSchema).array().optional(),
  notIn: z.lazy(() => VoucherScopeSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => NestedEnumVoucherScopeFilterSchema) ]).optional(),
});

export const NestedEnumDiscountTypeFilterSchema: z.ZodType<Prisma.NestedEnumDiscountTypeFilter> = z.strictObject({
  equals: z.lazy(() => DiscountTypeSchema).optional(),
  in: z.lazy(() => DiscountTypeSchema).array().optional(),
  notIn: z.lazy(() => DiscountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => NestedEnumDiscountTypeFilterSchema) ]).optional(),
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

export const NestedEnumVoucherStatusFilterSchema: z.ZodType<Prisma.NestedEnumVoucherStatusFilter> = z.strictObject({
  equals: z.lazy(() => VoucherStatusSchema).optional(),
  in: z.lazy(() => VoucherStatusSchema).array().optional(),
  notIn: z.lazy(() => VoucherStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => NestedEnumVoucherStatusFilterSchema) ]).optional(),
});

export const NestedEnumVoucherScopeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumVoucherScopeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => VoucherScopeSchema).optional(),
  in: z.lazy(() => VoucherScopeSchema).array().optional(),
  notIn: z.lazy(() => VoucherScopeSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => NestedEnumVoucherScopeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVoucherScopeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVoucherScopeFilterSchema).optional(),
});

export const NestedEnumDiscountTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumDiscountTypeWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => DiscountTypeSchema).optional(),
  in: z.lazy(() => DiscountTypeSchema).array().optional(),
  notIn: z.lazy(() => DiscountTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => NestedEnumDiscountTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumDiscountTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumDiscountTypeFilterSchema).optional(),
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

export const NestedEnumVoucherStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumVoucherStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => VoucherStatusSchema).optional(),
  in: z.lazy(() => VoucherStatusSchema).array().optional(),
  notIn: z.lazy(() => VoucherStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => NestedEnumVoucherStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVoucherStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVoucherStatusFilterSchema).optional(),
});

export const NestedUuidNullableFilterSchema: z.ZodType<Prisma.NestedUuidNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidNullableFilterSchema) ]).optional().nullable(),
});

export const NestedUuidNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedUuidNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedUuidNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
});

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
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

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const NestedEnumOrderStatusNullableFilterSchema: z.ZodType<Prisma.NestedEnumOrderStatusNullableFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusNullableFilterSchema) ]).optional().nullable(),
});

export const NestedEnumOrderStatusNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumOrderStatusNullableWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => OrderStatusSchema).optional().nullable(),
  in: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NestedEnumOrderStatusNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusNullableFilterSchema).optional(),
});

export const VoucherCreateWithoutUserInputSchema: z.ZodType<Prisma.VoucherCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => VoucherDetailCreateNestedManyWithoutVoucherInputSchema).optional(),
});

export const VoucherUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.VoucherUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutVoucherInputSchema).optional(),
});

export const VoucherCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.VoucherCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VoucherWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VoucherCreateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema) ]),
});

export const VoucherCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.VoucherCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => VoucherCreateManyUserInputSchema), z.lazy(() => VoucherCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ReviewCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
  orderDetail: z.lazy(() => OrderDetailCreateNestedOneWithoutReviewInputSchema),
});

export const ReviewUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  orderDetailId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
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

export const CartCreateWithoutUserInputSchema: z.ZodType<Prisma.CartCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => CartItemCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.CartUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  items: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutCartInputSchema).optional(),
});

export const CartCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CartCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => CartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema), z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]),
});

export const OrderCreateWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => OrderDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema), z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema) ]),
});

export const OrderCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderCreateManyUserInputSchema), z.lazy(() => OrderCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const ProductCreateWithoutVendorInputSchema: z.ZodType<Prisma.ProductCreateWithoutVendorInput> = z.strictObject({
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
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutVendorInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema) ]),
});

export const ProductCreateManyVendorInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManyVendorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => ProductCreateManyVendorInputSchema), z.lazy(() => ProductCreateManyVendorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const OrderStatusHistoryCreateWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateWithoutActorInput> = z.strictObject({
  id: z.uuid().optional(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutStatusHistoryInputSchema),
});

export const OrderStatusHistoryUncheckedCreateWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateWithoutActorInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const OrderStatusHistoryCreateOrConnectWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateOrConnectWithoutActorInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema) ]),
});

export const OrderStatusHistoryCreateManyActorInputEnvelopeSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyActorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderStatusHistoryCreateManyActorInputSchema), z.lazy(() => OrderStatusHistoryCreateManyActorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const VoucherUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.VoucherUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VoucherWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VoucherUpdateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => VoucherCreateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutUserInputSchema) ]),
});

export const VoucherUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.VoucherUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VoucherWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VoucherUpdateWithoutUserInputSchema), z.lazy(() => VoucherUncheckedUpdateWithoutUserInputSchema) ]),
});

export const VoucherUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.VoucherUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => VoucherScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VoucherUpdateManyMutationInputSchema), z.lazy(() => VoucherUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const VoucherScalarWhereInputSchema: z.ZodType<Prisma.VoucherScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VoucherScalarWhereInputSchema), z.lazy(() => VoucherScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherScalarWhereInputSchema), z.lazy(() => VoucherScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  scope: z.union([ z.lazy(() => EnumVoucherScopeFilterSchema), z.lazy(() => VoucherScopeSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => EnumDiscountTypeFilterSchema), z.lazy(() => DiscountTypeSchema) ]).optional(),
  discountValue: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  minOrderAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  usedQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  perUserLimit: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  startDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  endDate: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumVoucherStatusFilterSchema), z.lazy(() => VoucherStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
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
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderDetailId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  rating: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
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
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  items: z.lazy(() => CartItemUpdateManyWithoutCartNestedInputSchema).optional(),
});

export const CartUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.CartUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
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
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderCode: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  userId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  subtotalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  discountAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  shippingFee: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  totalAmount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  receiverName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  receiverPhone: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  shippingAddress: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  cancelledAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductUpsertWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVendorInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVendorInputSchema) ]),
});

export const ProductUpdateWithWhereUniqueWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutVendorInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVendorInputSchema) ]),
});

export const ProductUpdateManyWithWhereWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutVendorInput> = z.strictObject({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema), z.lazy(() => ProductUncheckedUpdateManyWithoutVendorInputSchema) ]),
});

export const ProductScalarWhereInputSchema: z.ZodType<Prisma.ProductScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereInputSchema), z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  categoryId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  vendorId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  slug: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const OrderStatusHistoryUpsertWithWhereUniqueWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpsertWithWhereUniqueWithoutActorInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedUpdateWithoutActorInputSchema) ]),
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutActorInputSchema) ]),
});

export const OrderStatusHistoryUpdateWithWhereUniqueWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateWithWhereUniqueWithoutActorInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithoutActorInputSchema), z.lazy(() => OrderStatusHistoryUncheckedUpdateWithoutActorInputSchema) ]),
});

export const OrderStatusHistoryUpdateManyWithWhereWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyWithWhereWithoutActorInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyMutationInputSchema), z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorInputSchema) ]),
});

export const OrderStatusHistoryScalarWhereInputSchema: z.ZodType<Prisma.OrderStatusHistoryScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderStatusHistoryScalarWhereInputSchema), z.lazy(() => OrderStatusHistoryScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  actorId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => EnumOrderStatusNullableFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema) ]).optional(),
  note: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const UserCreateWithoutVouchersInputSchema: z.ZodType<Prisma.UserCreateWithoutVouchersInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUncheckedCreateWithoutVouchersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutVouchersInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserCreateOrConnectWithoutVouchersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutVouchersInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVouchersInputSchema) ]),
});

export const VoucherDetailCreateWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailCreateWithoutVoucherInput> = z.strictObject({
  id: z.uuid().optional(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
  product: z.lazy(() => ProductCreateNestedOneWithoutVoucherDetailsInputSchema).optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutVoucherDetailsInputSchema).optional(),
});

export const VoucherDetailUncheckedCreateWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateWithoutVoucherInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailCreateOrConnectWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailCreateOrConnectWithoutVoucherInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema) ]),
});

export const VoucherDetailCreateManyVoucherInputEnvelopeSchema: z.ZodType<Prisma.VoucherDetailCreateManyVoucherInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => VoucherDetailCreateManyVoucherInputSchema), z.lazy(() => VoucherDetailCreateManyVoucherInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const UserUpsertWithoutVouchersInputSchema: z.ZodType<Prisma.UserUpsertWithoutVouchersInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVouchersInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedCreateWithoutVouchersInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutVouchersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutVouchersInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutVouchersInputSchema), z.lazy(() => UserUncheckedUpdateWithoutVouchersInputSchema) ]),
});

export const UserUpdateWithoutVouchersInputSchema: z.ZodType<Prisma.UserUpdateWithoutVouchersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutVouchersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutVouchersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const VoucherDetailUpsertWithWhereUniqueWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUpsertWithWhereUniqueWithoutVoucherInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateWithoutVoucherInputSchema) ]),
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutVoucherInputSchema) ]),
});

export const VoucherDetailUpdateWithWhereUniqueWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUpdateWithWhereUniqueWithoutVoucherInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VoucherDetailUpdateWithoutVoucherInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateWithoutVoucherInputSchema) ]),
});

export const VoucherDetailUpdateManyWithWhereWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyWithWhereWithoutVoucherInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VoucherDetailUpdateManyMutationInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutVoucherInputSchema) ]),
});

export const VoucherDetailScalarWhereInputSchema: z.ZodType<Prisma.VoucherDetailScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoucherDetailScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoucherDetailScalarWhereInputSchema), z.lazy(() => VoucherDetailScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  voucherId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  orderId: z.union([ z.lazy(() => UuidNullableFilterSchema), z.string() ]).optional().nullable(),
  eligibleAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  discountAmount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  sequence: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  reversedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const VoucherCreateWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherCreateWithoutDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutVouchersInputSchema),
});

export const VoucherUncheckedCreateWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherUncheckedCreateWithoutDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const VoucherCreateOrConnectWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherCreateOrConnectWithoutDetailsInput> = z.strictObject({
  where: z.lazy(() => VoucherWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VoucherCreateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutDetailsInputSchema) ]),
});

export const ProductCreateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductCreateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoryCreateNestedOneWithoutProductsInputSchema),
  vendor: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema).optional(),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutVoucherDetailsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVoucherDetailsInputSchema) ]),
});

export const OrderCreateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderCreateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  details: z.lazy(() => OrderDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentCreateNestedOneWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  userId: z.string(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedCreateNestedOneWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutVoucherDetailsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutVoucherDetailsInputSchema) ]),
});

export const VoucherUpsertWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherUpsertWithoutDetailsInput> = z.strictObject({
  update: z.union([ z.lazy(() => VoucherUpdateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedUpdateWithoutDetailsInputSchema) ]),
  create: z.union([ z.lazy(() => VoucherCreateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedCreateWithoutDetailsInputSchema) ]),
  where: z.lazy(() => VoucherWhereInputSchema).optional(),
});

export const VoucherUpdateToOneWithWhereWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherUpdateToOneWithWhereWithoutDetailsInput> = z.strictObject({
  where: z.lazy(() => VoucherWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => VoucherUpdateWithoutDetailsInputSchema), z.lazy(() => VoucherUncheckedUpdateWithoutDetailsInputSchema) ]),
});

export const VoucherUpdateWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherUpdateWithoutDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutVouchersNestedInputSchema).optional(),
});

export const VoucherUncheckedUpdateWithoutDetailsInputSchema: z.ZodType<Prisma.VoucherUncheckedUpdateWithoutDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductUpsertWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutVoucherDetailsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductUpdateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVoucherDetailsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutVoucherDetailsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional(),
});

export const ProductUpdateToOneWithWhereWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutVoucherDetailsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutVoucherDetailsInputSchema), z.lazy(() => ProductUncheckedUpdateWithoutVoucherDetailsInputSchema) ]),
});

export const ProductUpdateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductUpdateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoryUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  vendor: z.lazy(() => UserUpdateOneWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const OrderUpsertWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutVoucherDetailsInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderUpdateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutVoucherDetailsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutVoucherDetailsInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const OrderUpdateToOneWithWhereWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutVoucherDetailsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutVoucherDetailsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutVoucherDetailsInputSchema) ]),
});

export const OrderUpdateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderUpdateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  details: z.lazy(() => OrderDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUpdateOneWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutVoucherDetailsInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutVoucherDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedUpdateOneWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
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
  vendor: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema).optional(),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
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
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CategoryUncheckedCreateWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutProductsInput> = z.strictObject({
  id: z.uuid().optional(),
  name: z.string(),
  slug: z.string(),
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
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUncheckedCreateWithoutProductsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutProductsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutProductsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutProductsInputSchema), z.lazy(() => UserUncheckedCreateWithoutProductsInputSchema) ]),
});

export const ProductColorCreateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  variants: z.lazy(() => ProductVariantCreateNestedManyWithoutProductColorInputSchema).optional(),
});

export const ProductColorUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
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
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
  orderDetail: z.lazy(() => OrderDetailCreateNestedOneWithoutReviewInputSchema),
});

export const ReviewUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  orderDetailId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
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

export const VoucherDetailCreateWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
  voucher: z.lazy(() => VoucherCreateNestedOneWithoutDetailsInputSchema),
  order: z.lazy(() => OrderCreateNestedOneWithoutVoucherDetailsInputSchema).optional(),
});

export const VoucherDetailUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateWithoutProductInput> = z.strictObject({
  id: z.uuid().optional(),
  voucherId: z.string(),
  orderId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailCreateOrConnectWithoutProductInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema) ]),
});

export const VoucherDetailCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.VoucherDetailCreateManyProductInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => VoucherDetailCreateManyProductInputSchema), z.lazy(() => VoucherDetailCreateManyProductInputSchema).array() ]),
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
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const CategoryUncheckedUpdateWithoutProductsInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateWithoutProductsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
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
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutProductsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutProductsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  imageUrls: z.lazy(() => StringNullableListFilterSchema).optional(),
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

export const VoucherDetailUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUpsertWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutProductInputSchema) ]),
});

export const VoucherDetailUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUpdateWithWhereUniqueWithoutProductInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VoucherDetailUpdateWithoutProductInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateWithoutProductInputSchema) ]),
});

export const VoucherDetailUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyWithWhereWithoutProductInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VoucherDetailUpdateManyMutationInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutProductInputSchema) ]),
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
  vendor: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutColorsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutColorsInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutColorsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutColorsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutColorsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutColorsInputSchema) ]),
});

export const ProductVariantCreateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantCreateWithoutProductColorInput> = z.strictObject({
  id: z.uuid().optional(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateWithoutProductColorInput> = z.strictObject({
  id: z.uuid().optional(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
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
  vendor: z.lazy(() => UserUpdateOneWithoutProductsNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutColorsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutColorsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
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
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productColorId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  stock: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  size: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
});

export const ProductColorCreateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorCreateWithoutVariantsInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  product: z.lazy(() => ProductCreateNestedOneWithoutColorsInputSchema),
});

export const ProductColorUncheckedCreateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUncheckedCreateWithoutVariantsInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
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

export const OrderDetailCreateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailCreateWithoutProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  order: z.lazy(() => OrderCreateNestedOneWithoutDetailsInputSchema),
  review: z.lazy(() => ReviewCreateNestedOneWithoutOrderDetailInputSchema).optional(),
});

export const OrderDetailUncheckedCreateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUncheckedCreateWithoutProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  review: z.lazy(() => ReviewUncheckedCreateNestedOneWithoutOrderDetailInputSchema).optional(),
});

export const OrderDetailCreateOrConnectWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailCreateOrConnectWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema) ]),
});

export const OrderDetailCreateManyProductVariantInputEnvelopeSchema: z.ZodType<Prisma.OrderDetailCreateManyProductVariantInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderDetailCreateManyProductVariantInputSchema), z.lazy(() => OrderDetailCreateManyProductVariantInputSchema).array() ]),
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
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutColorsNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateWithoutVariantsInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateWithoutVariantsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
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
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const OrderDetailUpsertWithWhereUniqueWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUpsertWithWhereUniqueWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderDetailUpdateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutProductVariantInputSchema) ]),
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutProductVariantInputSchema) ]),
});

export const OrderDetailUpdateWithWhereUniqueWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUpdateWithWhereUniqueWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderDetailUpdateWithoutProductVariantInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutProductVariantInputSchema) ]),
});

export const OrderDetailUpdateManyWithWhereWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUpdateManyWithWhereWithoutProductVariantInput> = z.strictObject({
  where: z.lazy(() => OrderDetailScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderDetailUpdateManyMutationInputSchema), z.lazy(() => OrderDetailUncheckedUpdateManyWithoutProductVariantInputSchema) ]),
});

export const OrderDetailScalarWhereInputSchema: z.ZodType<Prisma.OrderDetailScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => OrderDetailScalarWhereInputSchema), z.lazy(() => OrderDetailScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OrderDetailScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OrderDetailScalarWhereInputSchema), z.lazy(() => OrderDetailScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  orderId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  productVariantId: z.union([ z.lazy(() => UuidFilterSchema), z.string() ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  productName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  colorName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  sizeName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
});

export const UserCreateWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUncheckedCreateWithoutReviewsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
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
  vendor: z.lazy(() => UserCreateNestedOneWithoutProductsInputSchema).optional(),
  colors: z.lazy(() => ProductColorCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductUncheckedCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutReviewsInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
});

export const ProductCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutReviewsInput> = z.strictObject({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema), z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]),
});

export const OrderDetailCreateWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailCreateWithoutReviewInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  order: z.lazy(() => OrderCreateNestedOneWithoutDetailsInputSchema),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutOrderDetailsInputSchema),
});

export const OrderDetailUncheckedCreateWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailUncheckedCreateWithoutReviewInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export const OrderDetailCreateOrConnectWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailCreateOrConnectWithoutReviewInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutReviewInputSchema) ]),
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
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutReviewsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
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
  vendor: z.lazy(() => UserUpdateOneWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutReviewsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const OrderDetailUpsertWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailUpsertWithoutReviewInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderDetailUpdateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutReviewInputSchema) ]),
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutReviewInputSchema) ]),
  where: z.lazy(() => OrderDetailWhereInputSchema).optional(),
});

export const OrderDetailUpdateToOneWithWhereWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailUpdateToOneWithWhereWithoutReviewInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderDetailUpdateWithoutReviewInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutReviewInputSchema) ]),
});

export const OrderDetailUpdateWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailUpdateWithoutReviewInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutDetailsNestedInputSchema).optional(),
  productVariant: z.lazy(() => ProductVariantUpdateOneRequiredWithoutOrderDetailsNestedInputSchema).optional(),
});

export const OrderDetailUncheckedUpdateWithoutReviewInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateWithoutReviewInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const UserCreateWithoutCartInputSchema: z.ZodType<Prisma.UserCreateWithoutCartInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUncheckedCreateWithoutCartInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCartInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
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
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutCartInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutCartInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
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

export const ProductVariantCreateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateWithoutCartItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  productColor: z.lazy(() => ProductColorCreateNestedOneWithoutVariantsInputSchema),
  orderDetails: z.lazy(() => OrderDetailCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateWithoutCartItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  orderDetails: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantCreateOrConnectWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantCreateOrConnectWithoutCartItemsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutCartItemsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutCartItemsInputSchema) ]),
});

export const CartCreateWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateWithoutItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutCartInputSchema),
});

export const CartUncheckedCreateWithoutItemsInputSchema: z.ZodType<Prisma.CartUncheckedCreateWithoutItemsInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const CartCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateOrConnectWithoutItemsInput> = z.strictObject({
  where: z.lazy(() => CartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema), z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]),
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
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productColor: z.lazy(() => ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateWithoutCartItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderDetails: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
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
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutCartNestedInputSchema).optional(),
});

export const CartUncheckedUpdateWithoutItemsInputSchema: z.ZodType<Prisma.CartUncheckedUpdateWithoutItemsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const UserCreateWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateWithoutOrdersInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserUncheckedCreateWithoutOrdersInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutOrdersInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutActorInputSchema).optional(),
});

export const UserCreateOrConnectWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutOrdersInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutOrdersInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema) ]),
});

export const OrderDetailCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  productVariant: z.lazy(() => ProductVariantCreateNestedOneWithoutOrderDetailsInputSchema),
  review: z.lazy(() => ReviewCreateNestedOneWithoutOrderDetailInputSchema).optional(),
});

export const OrderDetailUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUncheckedCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  review: z.lazy(() => ReviewUncheckedCreateNestedOneWithoutOrderDetailInputSchema).optional(),
});

export const OrderDetailCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailCreateOrConnectWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema) ]),
});

export const OrderDetailCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.OrderDetailCreateManyOrderInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderDetailCreateManyOrderInputSchema), z.lazy(() => OrderDetailCreateManyOrderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PaymentCreateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  transactionCode: z.string().optional().nullable(),
  gateway: z.string().optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const PaymentUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  method: z.lazy(() => PaymentMethodSchema),
  amount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  status: z.lazy(() => PaymentStatusSchema).optional(),
  transactionCode: z.string().optional().nullable(),
  gateway: z.string().optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const PaymentCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.PaymentCreateOrConnectWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => PaymentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]),
});

export const VoucherDetailCreateWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
  voucher: z.lazy(() => VoucherCreateNestedOneWithoutDetailsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutVoucherDetailsInputSchema).optional(),
});

export const VoucherDetailUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  voucherId: z.string(),
  productId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailCreateOrConnectWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema) ]),
});

export const VoucherDetailCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.VoucherDetailCreateManyOrderInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => VoucherDetailCreateManyOrderInputSchema), z.lazy(() => VoucherDetailCreateManyOrderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const OrderStatusHistoryCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  actor: z.lazy(() => UserCreateNestedOneWithoutOrderStatusHistoriesInputSchema).optional(),
});

export const OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedCreateWithoutOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  actorId: z.string().optional().nullable(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const OrderStatusHistoryCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateOrConnectWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema) ]),
});

export const OrderStatusHistoryCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyOrderInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => OrderStatusHistoryCreateManyOrderInputSchema), z.lazy(() => OrderStatusHistoryCreateManyOrderInputSchema).array() ]),
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
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutOrdersInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutOrdersInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
  orderStatusHistories: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutActorNestedInputSchema).optional(),
});

export const OrderDetailUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUpsertWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderDetailUpdateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => OrderDetailCreateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedCreateWithoutOrderInputSchema) ]),
});

export const OrderDetailUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUpdateWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderDetailWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderDetailUpdateWithoutOrderInputSchema), z.lazy(() => OrderDetailUncheckedUpdateWithoutOrderInputSchema) ]),
});

export const OrderDetailUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUpdateManyWithWhereWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderDetailScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderDetailUpdateManyMutationInputSchema), z.lazy(() => OrderDetailUncheckedUpdateManyWithoutOrderInputSchema) ]),
});

export const PaymentUpsertWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpsertWithoutOrderInput> = z.strictObject({
  update: z.union([ z.lazy(() => PaymentUpdateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => PaymentCreateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedCreateWithoutOrderInputSchema) ]),
  where: z.lazy(() => PaymentWhereInputSchema).optional(),
});

export const PaymentUpdateToOneWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpdateToOneWithWhereWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => PaymentWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PaymentUpdateWithoutOrderInputSchema), z.lazy(() => PaymentUncheckedUpdateWithoutOrderInputSchema) ]),
});

export const PaymentUpdateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  transactionCode: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gateway: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  failedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PaymentUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.PaymentUncheckedUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  method: z.union([ z.lazy(() => PaymentMethodSchema), z.lazy(() => EnumPaymentMethodFieldUpdateOperationsInputSchema) ]).optional(),
  amount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => PaymentStatusSchema), z.lazy(() => EnumPaymentStatusFieldUpdateOperationsInputSchema) ]).optional(),
  transactionCode: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gateway: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  gatewayResponse: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  paidAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  failedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VoucherDetailUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUpsertWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VoucherDetailUpdateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => VoucherDetailCreateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedCreateWithoutOrderInputSchema) ]),
});

export const VoucherDetailUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUpdateWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VoucherDetailUpdateWithoutOrderInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateWithoutOrderInputSchema) ]),
});

export const VoucherDetailUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUpdateManyWithWhereWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => VoucherDetailScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VoucherDetailUpdateManyMutationInputSchema), z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutOrderInputSchema) ]),
});

export const OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedUpdateWithoutOrderInputSchema) ]),
  create: z.union([ z.lazy(() => OrderStatusHistoryCreateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedCreateWithoutOrderInputSchema) ]),
});

export const OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderStatusHistoryUpdateWithoutOrderInputSchema), z.lazy(() => OrderStatusHistoryUncheckedUpdateWithoutOrderInputSchema) ]),
});

export const OrderStatusHistoryUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyWithWhereWithoutOrderInput> = z.strictObject({
  where: z.lazy(() => OrderStatusHistoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderStatusHistoryUpdateManyMutationInputSchema), z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderInputSchema) ]),
});

export const OrderCreateWithoutDetailsInputSchema: z.ZodType<Prisma.OrderCreateWithoutDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  payment: z.lazy(() => PaymentCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutDetailsInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  userId: z.string(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  payment: z.lazy(() => PaymentUncheckedCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutDetailsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutDetailsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutDetailsInputSchema) ]),
});

export const ProductVariantCreateWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantCreateWithoutOrderDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  productColor: z.lazy(() => ProductColorCreateNestedOneWithoutVariantsInputSchema),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantUncheckedCreateWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedCreateWithoutOrderDetailsInput> = z.strictObject({
  id: z.uuid().optional(),
  productColorId: z.string(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductVariantInputSchema).optional(),
});

export const ProductVariantCreateOrConnectWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantCreateOrConnectWithoutOrderDetailsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderDetailsInputSchema) ]),
});

export const ReviewCreateWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewCreateWithoutOrderDetailInput> = z.strictObject({
  id: z.uuid().optional(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
});

export const ReviewUncheckedCreateWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutOrderDetailInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  productId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateOrConnectWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutOrderDetailInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutOrderDetailInputSchema) ]),
});

export const OrderUpsertWithoutDetailsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutDetailsInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderUpdateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutDetailsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedCreateWithoutDetailsInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const OrderUpdateToOneWithWhereWithoutDetailsInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutDetailsInput> = z.strictObject({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutDetailsInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutDetailsInputSchema) ]),
});

export const OrderUpdateWithoutDetailsInputSchema: z.ZodType<Prisma.OrderUpdateWithoutDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutDetailsInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  payment: z.lazy(() => PaymentUncheckedUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const ProductVariantUpsertWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantUpsertWithoutOrderDetailsInput> = z.strictObject({
  update: z.union([ z.lazy(() => ProductVariantUpdateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutOrderDetailsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductVariantCreateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedCreateWithoutOrderDetailsInputSchema) ]),
  where: z.lazy(() => ProductVariantWhereInputSchema).optional(),
});

export const ProductVariantUpdateToOneWithWhereWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantUpdateToOneWithWhereWithoutOrderDetailsInput> = z.strictObject({
  where: z.lazy(() => ProductVariantWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductVariantUpdateWithoutOrderDetailsInputSchema), z.lazy(() => ProductVariantUncheckedUpdateWithoutOrderDetailsInputSchema) ]),
});

export const ProductVariantUpdateWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantUpdateWithoutOrderDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productColor: z.lazy(() => ProductColorUpdateOneRequiredWithoutVariantsNestedInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateWithoutOrderDetailsInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateWithoutOrderDetailsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productColorId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ReviewUpsertWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewUpsertWithoutOrderDetailInput> = z.strictObject({
  update: z.union([ z.lazy(() => ReviewUpdateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutOrderDetailInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedCreateWithoutOrderDetailInputSchema) ]),
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
});

export const ReviewUpdateToOneWithWhereWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewUpdateToOneWithWhereWithoutOrderDetailInput> = z.strictObject({
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutOrderDetailInputSchema), z.lazy(() => ReviewUncheckedUpdateWithoutOrderDetailInputSchema) ]),
});

export const ReviewUpdateWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutOrderDetailInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateWithoutOrderDetailInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutOrderDetailInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderCreateWithoutPaymentInputSchema: z.ZodType<Prisma.OrderCreateWithoutPaymentInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  details: z.lazy(() => OrderDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutPaymentInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutPaymentInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  userId: z.string(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutPaymentInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutPaymentInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentInputSchema) ]),
});

export const OrderUpsertWithoutPaymentInputSchema: z.ZodType<Prisma.OrderUpsertWithoutPaymentInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderUpdateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutPaymentInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedCreateWithoutPaymentInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const OrderUpdateToOneWithWhereWithoutPaymentInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutPaymentInput> = z.strictObject({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutPaymentInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutPaymentInputSchema) ]),
});

export const OrderUpdateWithoutPaymentInputSchema: z.ZodType<Prisma.OrderUpdateWithoutPaymentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  details: z.lazy(() => OrderDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutPaymentInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutPaymentInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderCreateWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderCreateWithoutStatusHistoryInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema),
  details: z.lazy(() => OrderDetailCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderUncheckedCreateWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutStatusHistoryInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  userId: z.string(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedCreateNestedOneWithoutOrderInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
});

export const OrderCreateOrConnectWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutStatusHistoryInput> = z.strictObject({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedCreateWithoutStatusHistoryInputSchema) ]),
});

export const UserCreateWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserCreateWithoutOrderStatusHistoriesInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const UserUncheckedCreateWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutOrderStatusHistoriesInput> = z.strictObject({
  id: z.uuid().optional(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleSchema).optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutVendorInputSchema).optional(),
});

export const UserCreateOrConnectWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutOrderStatusHistoriesInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrderStatusHistoriesInputSchema) ]),
});

export const OrderUpsertWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderUpsertWithoutStatusHistoryInput> = z.strictObject({
  update: z.union([ z.lazy(() => OrderUpdateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutStatusHistoryInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedCreateWithoutStatusHistoryInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional(),
});

export const OrderUpdateToOneWithWhereWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutStatusHistoryInput> = z.strictObject({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutStatusHistoryInputSchema), z.lazy(() => OrderUncheckedUpdateWithoutStatusHistoryInputSchema) ]),
});

export const OrderUpdateWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderUpdateWithoutStatusHistoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutOrdersNestedInputSchema).optional(),
  details: z.lazy(() => OrderDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutStatusHistoryInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutStatusHistoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const UserUpsertWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutOrderStatusHistoriesInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutOrderStatusHistoriesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedCreateWithoutOrderStatusHistoriesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutOrderStatusHistoriesInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutOrderStatusHistoriesInputSchema), z.lazy(() => UserUncheckedUpdateWithoutOrderStatusHistoriesInputSchema) ]),
});

export const UserUpdateWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserUpdateWithoutOrderStatusHistoriesInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const UserUncheckedUpdateWithoutOrderStatusHistoriesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutOrderStatusHistoriesInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fullName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.union([ z.lazy(() => UserRoleSchema), z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdBy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  vouchers: z.lazy(() => VoucherUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  cart: z.lazy(() => CartUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutVendorNestedInputSchema).optional(),
});

export const VoucherCreateManyUserInputSchema: z.ZodType<Prisma.VoucherCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  code: z.string(),
  name: z.string(),
  scope: z.lazy(() => VoucherScopeSchema),
  discountType: z.lazy(() => DiscountTypeSchema),
  discountValue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  minOrderAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  maxDiscountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  quantity: z.number().int(),
  usedQuantity: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.lazy(() => VoucherStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateManyUserInputSchema: z.ZodType<Prisma.ReviewCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string(),
  orderDetailId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const OrderCreateManyUserInputSchema: z.ZodType<Prisma.OrderCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  orderCode: z.cuid().optional(),
  subtotalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  shippingFee: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  totalAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  status: z.lazy(() => OrderStatusSchema).optional(),
  notes: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  receiverPhone: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cancelledAt: z.coerce.date().optional().nullable(),
});

export const ProductCreateManyVendorInputSchema: z.ZodType<Prisma.ProductCreateManyVendorInput> = z.strictObject({
  id: z.uuid().optional(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const OrderStatusHistoryCreateManyActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyActorInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const VoucherUpdateWithoutUserInputSchema: z.ZodType<Prisma.VoucherUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => VoucherDetailUpdateManyWithoutVoucherNestedInputSchema).optional(),
});

export const VoucherUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.VoucherUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutVoucherNestedInputSchema).optional(),
});

export const VoucherUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.VoucherUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  scope: z.union([ z.lazy(() => VoucherScopeSchema), z.lazy(() => EnumVoucherScopeFieldUpdateOperationsInputSchema) ]).optional(),
  discountType: z.union([ z.lazy(() => DiscountTypeSchema), z.lazy(() => EnumDiscountTypeFieldUpdateOperationsInputSchema) ]).optional(),
  discountValue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  minOrderAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  maxDiscountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedQuantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  perUserLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  startDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endDate: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => VoucherStatusSchema), z.lazy(() => EnumVoucherStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  orderDetail: z.lazy(() => OrderDetailUpdateOneRequiredWithoutReviewNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDetailId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDetailId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderUpdateWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => OrderDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  details: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  payment: z.lazy(() => PaymentUncheckedUpdateOneWithoutOrderNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
  statusHistory: z.lazy(() => OrderStatusHistoryUncheckedUpdateManyWithoutOrderNestedInputSchema).optional(),
});

export const OrderUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderCode: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  subtotalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  shippingFee: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  totalAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  receiverPhone: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  shippingAddress: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductUpdateWithoutVendorInputSchema: z.ZodType<Prisma.ProductUpdateWithoutVendorInput> = z.strictObject({
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
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateManyWithoutVendorInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutVendorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  categoryId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderStatusHistoryUpdateWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateWithoutActorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutStatusHistoryNestedInputSchema).optional(),
});

export const OrderStatusHistoryUncheckedUpdateWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateWithoutActorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderStatusHistoryUncheckedUpdateManyWithoutActorInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyWithoutActorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const VoucherDetailCreateManyVoucherInputSchema: z.ZodType<Prisma.VoucherDetailCreateManyVoucherInput> = z.strictObject({
  id: z.uuid().optional(),
  productId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailUpdateWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUpdateWithoutVoucherInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product: z.lazy(() => ProductUpdateOneWithoutVoucherDetailsNestedInputSchema).optional(),
  order: z.lazy(() => OrderUpdateOneWithoutVoucherDetailsNestedInputSchema).optional(),
});

export const VoucherDetailUncheckedUpdateWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateWithoutVoucherInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailUncheckedUpdateManyWithoutVoucherInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyWithoutVoucherInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  orderId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductCreateManyCategoryInputSchema: z.ZodType<Prisma.ProductCreateManyCategoryInput> = z.strictObject({
  id: z.uuid().optional(),
  vendorId: z.string().optional().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
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
  vendor: z.lazy(() => UserUpdateOneWithoutProductsNestedInputSchema).optional(),
  colors: z.lazy(() => ProductColorUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colors: z.lazy(() => ProductColorUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  voucherDetails: z.lazy(() => VoucherDetailUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
});

export const ProductUncheckedUpdateManyWithoutCategoryInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  vendorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => ProductStatusSchema), z.lazy(() => EnumProductStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductColorCreateManyProductInputSchema: z.ZodType<Prisma.ProductColorCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  color: z.string(),
  imageUrls: z.union([ z.lazy(() => ProductColorCreateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ReviewCreateManyProductInputSchema: z.ZodType<Prisma.ReviewCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  userId: z.string(),
  orderDetailId: z.string(),
  content: z.string().optional().nullable(),
  rating: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const VoucherDetailCreateManyProductInputSchema: z.ZodType<Prisma.VoucherDetailCreateManyProductInput> = z.strictObject({
  id: z.uuid().optional(),
  voucherId: z.string(),
  orderId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const ProductColorUpdateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  variants: z.lazy(() => ProductVariantUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  variants: z.lazy(() => ProductVariantUncheckedUpdateManyWithoutProductColorNestedInputSchema).optional(),
});

export const ProductColorUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.ProductColorUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  imageUrls: z.union([ z.lazy(() => ProductColorUpdateimageUrlsInputSchema), z.string().array() ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUpdateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  orderDetail: z.lazy(() => OrderDetailUpdateOneRequiredWithoutReviewNestedInputSchema).optional(),
});

export const ReviewUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDetailId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ReviewUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderDetailId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  rating: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailUpdateWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  voucher: z.lazy(() => VoucherUpdateOneRequiredWithoutDetailsNestedInputSchema).optional(),
  order: z.lazy(() => OrderUpdateOneWithoutVoucherDetailsNestedInputSchema).optional(),
});

export const VoucherDetailUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  voucherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyWithoutProductInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  voucherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const ProductVariantCreateManyProductColorInputSchema: z.ZodType<Prisma.ProductVariantCreateManyProductColorInput> = z.strictObject({
  id: z.uuid().optional(),
  stock: z.number().int().optional(),
  size: z.string(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const ProductVariantUpdateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUpdateWithoutProductColorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateWithoutProductColorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
  orderDetails: z.lazy(() => OrderDetailUncheckedUpdateManyWithoutProductVariantNestedInputSchema).optional(),
});

export const ProductVariantUncheckedUpdateManyWithoutProductColorInputSchema: z.ZodType<Prisma.ProductVariantUncheckedUpdateManyWithoutProductColorInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  stock: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  size: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
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

export const OrderDetailCreateManyProductVariantInputSchema: z.ZodType<Prisma.OrderDetailCreateManyProductVariantInput> = z.strictObject({
  id: z.uuid().optional(),
  orderId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
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

export const OrderDetailUpdateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUpdateWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  order: z.lazy(() => OrderUpdateOneRequiredWithoutDetailsNestedInputSchema).optional(),
  review: z.lazy(() => ReviewUpdateOneWithoutOrderDetailNestedInputSchema).optional(),
});

export const OrderDetailUncheckedUpdateWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  review: z.lazy(() => ReviewUncheckedUpdateOneWithoutOrderDetailNestedInputSchema).optional(),
});

export const OrderDetailUncheckedUpdateManyWithoutProductVariantInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateManyWithoutProductVariantInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  orderId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
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

export const OrderDetailCreateManyOrderInputSchema: z.ZodType<Prisma.OrderDetailCreateManyOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  productVariantId: z.string(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  productName: z.string().optional().nullable(),
  colorName: z.string().optional().nullable(),
  sizeName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export const VoucherDetailCreateManyOrderInputSchema: z.ZodType<Prisma.VoucherDetailCreateManyOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  voucherId: z.string(),
  productId: z.string().optional().nullable(),
  eligibleAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  sequence: z.number().int().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  reversedAt: z.coerce.date().optional().nullable(),
});

export const OrderStatusHistoryCreateManyOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyOrderInput> = z.strictObject({
  id: z.uuid().optional(),
  actorId: z.string().optional().nullable(),
  fromStatus: z.lazy(() => OrderStatusSchema).optional().nullable(),
  toStatus: z.lazy(() => OrderStatusSchema),
  note: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const OrderDetailUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  productVariant: z.lazy(() => ProductVariantUpdateOneRequiredWithoutOrderDetailsNestedInputSchema).optional(),
  review: z.lazy(() => ReviewUpdateOneWithoutOrderDetailNestedInputSchema).optional(),
});

export const OrderDetailUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  review: z.lazy(() => ReviewUncheckedUpdateOneWithoutOrderDetailNestedInputSchema).optional(),
});

export const OrderDetailUncheckedUpdateManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderDetailUncheckedUpdateManyWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productVariantId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  productName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  colorName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sizeName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailUpdateWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  voucher: z.lazy(() => VoucherUpdateOneRequiredWithoutDetailsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutVoucherDetailsNestedInputSchema).optional(),
});

export const VoucherDetailUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  voucherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const VoucherDetailUncheckedUpdateManyWithoutOrderInputSchema: z.ZodType<Prisma.VoucherDetailUncheckedUpdateManyWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  voucherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  productId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  eligibleAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  discountAmount: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sequence: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reversedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const OrderStatusHistoryUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  actor: z.lazy(() => UserUpdateOneWithoutOrderStatusHistoriesNestedInputSchema).optional(),
});

export const OrderStatusHistoryUncheckedUpdateWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const OrderStatusHistoryUncheckedUpdateManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderStatusHistoryUncheckedUpdateManyWithoutOrderInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  actorId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  fromStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => NullableEnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  toStatus: z.union([ z.lazy(() => OrderStatusSchema), z.lazy(() => EnumOrderStatusFieldUpdateOperationsInputSchema) ]).optional(),
  note: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
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

export const VoucherFindFirstArgsSchema: z.ZodType<Prisma.VoucherFindFirstArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherOrderByWithRelationInputSchema.array(), VoucherOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoucherScalarFieldEnumSchema, VoucherScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoucherFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VoucherFindFirstOrThrowArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherOrderByWithRelationInputSchema.array(), VoucherOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoucherScalarFieldEnumSchema, VoucherScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoucherFindManyArgsSchema: z.ZodType<Prisma.VoucherFindManyArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherOrderByWithRelationInputSchema.array(), VoucherOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoucherScalarFieldEnumSchema, VoucherScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoucherAggregateArgsSchema: z.ZodType<Prisma.VoucherAggregateArgs> = z.object({
  where: VoucherWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherOrderByWithRelationInputSchema.array(), VoucherOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VoucherGroupByArgsSchema: z.ZodType<Prisma.VoucherGroupByArgs> = z.object({
  where: VoucherWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherOrderByWithAggregationInputSchema.array(), VoucherOrderByWithAggregationInputSchema ]).optional(),
  by: VoucherScalarFieldEnumSchema.array(), 
  having: VoucherScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VoucherFindUniqueArgsSchema: z.ZodType<Prisma.VoucherFindUniqueArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereUniqueInputSchema, 
}).strict();

export const VoucherFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VoucherFindUniqueOrThrowArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereUniqueInputSchema, 
}).strict();

export const VoucherDetailFindFirstArgsSchema: z.ZodType<Prisma.VoucherDetailFindFirstArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherDetailOrderByWithRelationInputSchema.array(), VoucherDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoucherDetailScalarFieldEnumSchema, VoucherDetailScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoucherDetailFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VoucherDetailFindFirstOrThrowArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherDetailOrderByWithRelationInputSchema.array(), VoucherDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoucherDetailScalarFieldEnumSchema, VoucherDetailScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoucherDetailFindManyArgsSchema: z.ZodType<Prisma.VoucherDetailFindManyArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherDetailOrderByWithRelationInputSchema.array(), VoucherDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoucherDetailScalarFieldEnumSchema, VoucherDetailScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoucherDetailAggregateArgsSchema: z.ZodType<Prisma.VoucherDetailAggregateArgs> = z.object({
  where: VoucherDetailWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherDetailOrderByWithRelationInputSchema.array(), VoucherDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: VoucherDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VoucherDetailGroupByArgsSchema: z.ZodType<Prisma.VoucherDetailGroupByArgs> = z.object({
  where: VoucherDetailWhereInputSchema.optional(), 
  orderBy: z.union([ VoucherDetailOrderByWithAggregationInputSchema.array(), VoucherDetailOrderByWithAggregationInputSchema ]).optional(),
  by: VoucherDetailScalarFieldEnumSchema.array(), 
  having: VoucherDetailScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VoucherDetailFindUniqueArgsSchema: z.ZodType<Prisma.VoucherDetailFindUniqueArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereUniqueInputSchema, 
}).strict();

export const VoucherDetailFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VoucherDetailFindUniqueOrThrowArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereUniqueInputSchema, 
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

export const OrderDetailFindFirstArgsSchema: z.ZodType<Prisma.OrderDetailFindFirstArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereInputSchema.optional(), 
  orderBy: z.union([ OrderDetailOrderByWithRelationInputSchema.array(), OrderDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderDetailScalarFieldEnumSchema, OrderDetailScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderDetailFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderDetailFindFirstOrThrowArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereInputSchema.optional(), 
  orderBy: z.union([ OrderDetailOrderByWithRelationInputSchema.array(), OrderDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderDetailScalarFieldEnumSchema, OrderDetailScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderDetailFindManyArgsSchema: z.ZodType<Prisma.OrderDetailFindManyArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereInputSchema.optional(), 
  orderBy: z.union([ OrderDetailOrderByWithRelationInputSchema.array(), OrderDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderDetailScalarFieldEnumSchema, OrderDetailScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderDetailAggregateArgsSchema: z.ZodType<Prisma.OrderDetailAggregateArgs> = z.object({
  where: OrderDetailWhereInputSchema.optional(), 
  orderBy: z.union([ OrderDetailOrderByWithRelationInputSchema.array(), OrderDetailOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderDetailWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderDetailGroupByArgsSchema: z.ZodType<Prisma.OrderDetailGroupByArgs> = z.object({
  where: OrderDetailWhereInputSchema.optional(), 
  orderBy: z.union([ OrderDetailOrderByWithAggregationInputSchema.array(), OrderDetailOrderByWithAggregationInputSchema ]).optional(),
  by: OrderDetailScalarFieldEnumSchema.array(), 
  having: OrderDetailScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderDetailFindUniqueArgsSchema: z.ZodType<Prisma.OrderDetailFindUniqueArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereUniqueInputSchema, 
}).strict();

export const OrderDetailFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderDetailFindUniqueOrThrowArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereUniqueInputSchema, 
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

export const OrderStatusHistoryFindFirstArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindFirstArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(), OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderStatusHistoryScalarFieldEnumSchema, OrderStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderStatusHistoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindFirstOrThrowArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(), OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderStatusHistoryScalarFieldEnumSchema, OrderStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderStatusHistoryFindManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindManyArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(), OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ OrderStatusHistoryScalarFieldEnumSchema, OrderStatusHistoryScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const OrderStatusHistoryAggregateArgsSchema: z.ZodType<Prisma.OrderStatusHistoryAggregateArgs> = z.object({
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ OrderStatusHistoryOrderByWithRelationInputSchema.array(), OrderStatusHistoryOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderStatusHistoryWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderStatusHistoryGroupByArgsSchema: z.ZodType<Prisma.OrderStatusHistoryGroupByArgs> = z.object({
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  orderBy: z.union([ OrderStatusHistoryOrderByWithAggregationInputSchema.array(), OrderStatusHistoryOrderByWithAggregationInputSchema ]).optional(),
  by: OrderStatusHistoryScalarFieldEnumSchema.array(), 
  having: OrderStatusHistoryScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const OrderStatusHistoryFindUniqueArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindUniqueArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema, 
}).strict();

export const OrderStatusHistoryFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.OrderStatusHistoryFindUniqueOrThrowArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema, 
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

export const VoucherCreateArgsSchema: z.ZodType<Prisma.VoucherCreateArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  data: z.union([ VoucherCreateInputSchema, VoucherUncheckedCreateInputSchema ]),
}).strict();

export const VoucherUpsertArgsSchema: z.ZodType<Prisma.VoucherUpsertArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereUniqueInputSchema, 
  create: z.union([ VoucherCreateInputSchema, VoucherUncheckedCreateInputSchema ]),
  update: z.union([ VoucherUpdateInputSchema, VoucherUncheckedUpdateInputSchema ]),
}).strict();

export const VoucherCreateManyArgsSchema: z.ZodType<Prisma.VoucherCreateManyArgs> = z.object({
  data: z.union([ VoucherCreateManyInputSchema, VoucherCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoucherCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VoucherCreateManyAndReturnArgs> = z.object({
  data: z.union([ VoucherCreateManyInputSchema, VoucherCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoucherDeleteArgsSchema: z.ZodType<Prisma.VoucherDeleteArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  where: VoucherWhereUniqueInputSchema, 
}).strict();

export const VoucherUpdateArgsSchema: z.ZodType<Prisma.VoucherUpdateArgs> = z.object({
  select: VoucherSelectSchema.optional(),
  include: VoucherIncludeSchema.optional(),
  data: z.union([ VoucherUpdateInputSchema, VoucherUncheckedUpdateInputSchema ]),
  where: VoucherWhereUniqueInputSchema, 
}).strict();

export const VoucherUpdateManyArgsSchema: z.ZodType<Prisma.VoucherUpdateManyArgs> = z.object({
  data: z.union([ VoucherUpdateManyMutationInputSchema, VoucherUncheckedUpdateManyInputSchema ]),
  where: VoucherWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoucherUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VoucherUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VoucherUpdateManyMutationInputSchema, VoucherUncheckedUpdateManyInputSchema ]),
  where: VoucherWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoucherDeleteManyArgsSchema: z.ZodType<Prisma.VoucherDeleteManyArgs> = z.object({
  where: VoucherWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoucherDetailCreateArgsSchema: z.ZodType<Prisma.VoucherDetailCreateArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  data: z.union([ VoucherDetailCreateInputSchema, VoucherDetailUncheckedCreateInputSchema ]),
}).strict();

export const VoucherDetailUpsertArgsSchema: z.ZodType<Prisma.VoucherDetailUpsertArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereUniqueInputSchema, 
  create: z.union([ VoucherDetailCreateInputSchema, VoucherDetailUncheckedCreateInputSchema ]),
  update: z.union([ VoucherDetailUpdateInputSchema, VoucherDetailUncheckedUpdateInputSchema ]),
}).strict();

export const VoucherDetailCreateManyArgsSchema: z.ZodType<Prisma.VoucherDetailCreateManyArgs> = z.object({
  data: z.union([ VoucherDetailCreateManyInputSchema, VoucherDetailCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoucherDetailCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VoucherDetailCreateManyAndReturnArgs> = z.object({
  data: z.union([ VoucherDetailCreateManyInputSchema, VoucherDetailCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoucherDetailDeleteArgsSchema: z.ZodType<Prisma.VoucherDetailDeleteArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  where: VoucherDetailWhereUniqueInputSchema, 
}).strict();

export const VoucherDetailUpdateArgsSchema: z.ZodType<Prisma.VoucherDetailUpdateArgs> = z.object({
  select: VoucherDetailSelectSchema.optional(),
  include: VoucherDetailIncludeSchema.optional(),
  data: z.union([ VoucherDetailUpdateInputSchema, VoucherDetailUncheckedUpdateInputSchema ]),
  where: VoucherDetailWhereUniqueInputSchema, 
}).strict();

export const VoucherDetailUpdateManyArgsSchema: z.ZodType<Prisma.VoucherDetailUpdateManyArgs> = z.object({
  data: z.union([ VoucherDetailUpdateManyMutationInputSchema, VoucherDetailUncheckedUpdateManyInputSchema ]),
  where: VoucherDetailWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoucherDetailUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VoucherDetailUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VoucherDetailUpdateManyMutationInputSchema, VoucherDetailUncheckedUpdateManyInputSchema ]),
  where: VoucherDetailWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoucherDetailDeleteManyArgsSchema: z.ZodType<Prisma.VoucherDetailDeleteManyArgs> = z.object({
  where: VoucherDetailWhereInputSchema.optional(), 
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

export const OrderDetailCreateArgsSchema: z.ZodType<Prisma.OrderDetailCreateArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  data: z.union([ OrderDetailCreateInputSchema, OrderDetailUncheckedCreateInputSchema ]),
}).strict();

export const OrderDetailUpsertArgsSchema: z.ZodType<Prisma.OrderDetailUpsertArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereUniqueInputSchema, 
  create: z.union([ OrderDetailCreateInputSchema, OrderDetailUncheckedCreateInputSchema ]),
  update: z.union([ OrderDetailUpdateInputSchema, OrderDetailUncheckedUpdateInputSchema ]),
}).strict();

export const OrderDetailCreateManyArgsSchema: z.ZodType<Prisma.OrderDetailCreateManyArgs> = z.object({
  data: z.union([ OrderDetailCreateManyInputSchema, OrderDetailCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderDetailCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderDetailCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderDetailCreateManyInputSchema, OrderDetailCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderDetailDeleteArgsSchema: z.ZodType<Prisma.OrderDetailDeleteArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  where: OrderDetailWhereUniqueInputSchema, 
}).strict();

export const OrderDetailUpdateArgsSchema: z.ZodType<Prisma.OrderDetailUpdateArgs> = z.object({
  select: OrderDetailSelectSchema.optional(),
  include: OrderDetailIncludeSchema.optional(),
  data: z.union([ OrderDetailUpdateInputSchema, OrderDetailUncheckedUpdateInputSchema ]),
  where: OrderDetailWhereUniqueInputSchema, 
}).strict();

export const OrderDetailUpdateManyArgsSchema: z.ZodType<Prisma.OrderDetailUpdateManyArgs> = z.object({
  data: z.union([ OrderDetailUpdateManyMutationInputSchema, OrderDetailUncheckedUpdateManyInputSchema ]),
  where: OrderDetailWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderDetailUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderDetailUpdateManyAndReturnArgs> = z.object({
  data: z.union([ OrderDetailUpdateManyMutationInputSchema, OrderDetailUncheckedUpdateManyInputSchema ]),
  where: OrderDetailWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderDetailDeleteManyArgsSchema: z.ZodType<Prisma.OrderDetailDeleteManyArgs> = z.object({
  where: OrderDetailWhereInputSchema.optional(), 
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

export const OrderStatusHistoryCreateArgsSchema: z.ZodType<Prisma.OrderStatusHistoryCreateArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  data: z.union([ OrderStatusHistoryCreateInputSchema, OrderStatusHistoryUncheckedCreateInputSchema ]),
}).strict();

export const OrderStatusHistoryUpsertArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpsertArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema, 
  create: z.union([ OrderStatusHistoryCreateInputSchema, OrderStatusHistoryUncheckedCreateInputSchema ]),
  update: z.union([ OrderStatusHistoryUpdateInputSchema, OrderStatusHistoryUncheckedUpdateInputSchema ]),
}).strict();

export const OrderStatusHistoryCreateManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyArgs> = z.object({
  data: z.union([ OrderStatusHistoryCreateManyInputSchema, OrderStatusHistoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderStatusHistoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderStatusHistoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderStatusHistoryCreateManyInputSchema, OrderStatusHistoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const OrderStatusHistoryDeleteArgsSchema: z.ZodType<Prisma.OrderStatusHistoryDeleteArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  where: OrderStatusHistoryWhereUniqueInputSchema, 
}).strict();

export const OrderStatusHistoryUpdateArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateArgs> = z.object({
  select: OrderStatusHistorySelectSchema.optional(),
  include: OrderStatusHistoryIncludeSchema.optional(),
  data: z.union([ OrderStatusHistoryUpdateInputSchema, OrderStatusHistoryUncheckedUpdateInputSchema ]),
  where: OrderStatusHistoryWhereUniqueInputSchema, 
}).strict();

export const OrderStatusHistoryUpdateManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyArgs> = z.object({
  data: z.union([ OrderStatusHistoryUpdateManyMutationInputSchema, OrderStatusHistoryUncheckedUpdateManyInputSchema ]),
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderStatusHistoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderStatusHistoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ OrderStatusHistoryUpdateManyMutationInputSchema, OrderStatusHistoryUncheckedUpdateManyInputSchema ]),
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const OrderStatusHistoryDeleteManyArgsSchema: z.ZodType<Prisma.OrderStatusHistoryDeleteManyArgs> = z.object({
  where: OrderStatusHistoryWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();