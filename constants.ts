import { Lead, LeadStatus, SaleAllocation, DesignItem, Employee, EmployeeStatus, DesignOrder, DesignOrderStatus, Order, OrderStatus } from './types';

export const SALE_AGENTS = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];
export const LEAD_SOURCES = ['Facebook Ads', 'Facebook Group', 'Website', 'Zalo', 'Giới thiệu', 'Tiktok'];
export const CUSTOMER_GROUPS = ['Bán lẻ', 'Đại lý', 'Dự án', 'Vãng lai'];
export const PRODUCT_TYPES = ['Túi giấy', 'Túi vải', 'Hộp giấy', 'Bao bì nhựa', 'In offset', 'In kỹ thuật số', 'Thiết kế', 'Khác'];

// Helper to create dates relative to now
const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

export const MOCK_LEADS: Lead[] = [
  {
    id: 'KH001',
    group: 'Bán lẻ',
    name: 'Nguyễn Văn Mạnh',
    phone: '0912345678',
    source: 'Facebook Ads',
    sourceName: 'Fanpage Đồ Gia Dụng',
    productType: 'Túi giấy',
    saleName: 'Nguyễn Văn A',
    callLog: { count: 1, content: '1. Khách hỏi giá, chưa chốt' },
    note: 'Cần tư vấn thêm về bảo hành',
    status: LeadStatus.THINKING,
    isOrderCreated: false,
    assignedAt: minutesAgo(45), // Assigned 45 mins ago
    // Still processing (no processedAt)
  },
  {
    id: 'KH002',
    group: 'Đại lý',
    name: 'Công ty TNHH ABC',
    phone: '0987654321',
    source: 'Website',
    sourceName: 'Form đăng ký đại lý',
    productType: 'Hộp giấy',
    saleName: 'Trần Thị B',
    callLog: { count: 0, content: '' },
    note: '',
    status: LeadStatus.NEW,
    isOrderCreated: false,
    assignedAt: minutesAgo(120), // Assigned 2 hours ago
    // Still processing
  },
  {
    id: 'KH003',
    group: 'Dự án',
    name: 'Tập đoàn XYZ',
    phone: '0909090909',
    source: 'Giới thiệu',
    sourceName: 'Anh Ba giới thiệu',    productType: 'In offset',    saleName: 'Lê Văn C',
    callLog: { count: 2, content: '1. Gọi lần 1 thuê bao\n2. Gọi lại khách bảo gửi email' },
    note: 'Gửi báo giá qua email',
    status: LeadStatus.INTERESTED,
    isOrderCreated: false,
    assignedAt: minutesAgo(300), 
    processedAt: minutesAgo(280), // Processed 20 mins after assignment
  },
  {
    id: 'KH004',
    group: 'Bán lẻ',
    name: 'Phạm Thị Hoa',
    phone: '0911223344',
    source: 'Facebook Group',
    sourceName: 'Hội Mẹ Bỉm Sữa',
    productType: 'Túi vải',
    saleName: 'Nguyễn Văn A',
    callLog: { count: 3, content: '1. Tư vấn SP A\n2. Khách chê đắt\n3. Chốt đơn giảm giá 5%' },
    note: 'Đã lên đơn',
    status: LeadStatus.CLOSED,
    isOrderCreated: true,
    assignedAt: minutesAgo(1440), // Yesterday
    processedAt: minutesAgo(1400), // Processed
  },
];

export const MOCK_ALLOCATIONS: SaleAllocation[] = [
  {
    id: 'SP001',
    customerGroup: 'Bán lẻ',
    productGroups: ['Gia dụng', 'Điện tử'],
    products: ['Nồi cơm', 'Quạt điện'],
    assignedSales: ['Nguyễn Văn A', 'Trần Thị B'],
  },
  {
    id: 'SP002',
    customerGroup: 'Đại lý',
    productGroups: ['Công nghiệp'],
    products: ['Máy in', 'Máy cắt'],
    assignedSales: ['Lê Văn C'],
  },
];

export const MOCK_DESIGNS: DesignItem[] = [
  {
    id: 'D001',
    title: 'Landing Page Mỹ Phẩm',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    category: 'Mỹ phẩm',
    description: 'Thiết kế tone hồng, sang trọng',
  },
  {
    id: 'D002',
    title: 'Banner Khuyến Mãi',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    category: 'Sự kiện',
    description: 'Banner đỏ, nổi bật cho sale 11/11',
  },
  {
    id: 'D003',
    title: 'Catalogue Nội Thất',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    category: 'Nội thất',
    description: 'Phong cách tối giản, hiện đại',
  },
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'NV001',
    name: 'Nguyễn Văn A',
    position: 'Sale Executive',
    department: 'Kinh Doanh',
    phone: '0988777666',
    email: 'nva@company.com',
    joinDate: '2023-01-15',
    status: EmployeeStatus.ACTIVE,
    avatar: 'NA'
  },
  {
    id: 'NV002',
    name: 'Trần Thị B',
    position: 'Sale Executive',
    department: 'Kinh Doanh',
    phone: '0911222333',
    email: 'ttb@company.com',
    joinDate: '2023-03-20',
    status: EmployeeStatus.ACTIVE,
    avatar: 'TB'
  },
  {
    id: 'NV003',
    name: 'Lê Văn C',
    position: 'Sale Leader',
    department: 'Kinh Doanh',
    phone: '0909090909',
    email: 'lvc@company.com',
    joinDate: '2022-05-10',
    status: EmployeeStatus.LEAVE,
    avatar: 'LC'
  },
  {
    id: 'NV004',
    name: 'Phạm Thị D',
    position: 'Designer',
    department: 'Thiết kế',
    phone: '0944555666',
    email: 'ptd@company.com',
    joinDate: '2023-08-01',
    status: EmployeeStatus.ACTIVE,
    avatar: 'PD'
  },
  {
    id: 'NV005',
    name: 'Hoàng Văn E',
    position: 'HR Manager',
    department: 'Hành chính nhân sự',
    phone: '0977888999',
    email: 'hve@company.com',
    joinDate: '2021-12-01',
    status: EmployeeStatus.ACTIVE,
    avatar: 'HE'
  }
];

export const MOCK_DESIGN_ORDERS: DesignOrder[] = [
  {
    id: 'DH001',
    customerName: 'Spa Thẩm Mỹ Lan Anh',
    phone: '0912345678',
    productType: 'Bộ nhận diện',
    requirements: 'Thiết kế Logo + Namecard tông màu vàng gold, sang trọng. Cần file vector gốc.',
    designer: 'Phạm Thị D',
    status: DesignOrderStatus.IN_PROGRESS,
    revenue: 2500000,
    deadline: daysFromNow(2),
    createdAt: minutesAgo(2000)
  },
  {
    id: 'DH002',
    customerName: 'Nhà hàng Biển Đông',
    phone: '0988777666',
    productType: 'Menu',
    requirements: 'Làm lại menu 10 trang, phong cách nhiệt đới (Tropical). Gửi trước bản demo trang bìa.',
    designer: 'Phạm Thị D',
    status: DesignOrderStatus.REVIEW,
    revenue: 1500000,
    deadline: daysFromNow(1),
    createdAt: minutesAgo(4000)
  },
  {
    id: 'DH003',
    customerName: 'Shop Quần Áo Mây',
    phone: '0909111222',
    productType: 'Banner Ads',
    requirements: '5 Banner chạy quảng cáo Facebook size vuông và chữ nhật. Nội dung Sale off 50%.',
    designer: 'Chưa phân bổ',
    status: DesignOrderStatus.PENDING,
    revenue: 500000,
    deadline: daysFromNow(3),
    createdAt: minutesAgo(120)
  },
  {
    id: 'DH004',
    customerName: 'Cty Bất Động Sản Hưng Thịnh',
    phone: '0944555888',
    productType: 'Brochure',
    requirements: 'Thiết kế Brochure dự án mới, khổ A4 gấp 3. Hình ảnh đã có sẵn trong drive.',
    designer: 'Phạm Thị D',
    status: DesignOrderStatus.COMPLETED,
    revenue: 3000000,
    deadline: daysFromNow(-1),
    createdAt: minutesAgo(10000)
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'DH1001',
    customerName: 'Phạm Thị Hoa',
    customerPhone: '0911223344',
    customerGroup: 'Bán lẻ',
    source: 'Facebook Group',
    saleName: 'Nguyễn Văn A',
    createdAt: minutesAgo(1400),
    productName: 'Combo Gia Dụng A',
    requirements: 'Gói quà cẩn thận, giao giờ hành chính',
    status: OrderStatus.PROCESSING,
    revenue: 550000,
    paymentHistory: [
      { id: 'PAY01', date: minutesAgo(100), amount: 550000, content: 'CK VCB', imageProof: 'url' }
    ],
    callCount: 3
  },
  {
    id: 'DH1002',
    customerName: 'Minh Long Corp',
    customerPhone: '0999888777',
    customerGroup: 'Dự án',
    source: 'Giới thiệu',
    saleName: 'Lê Văn C',
    createdAt: minutesAgo(2800),
    productName: 'Hợp đồng in ấn Q1',
    requirements: 'Xuất hóa đơn VAT, giao hàng tại kho',
    status: OrderStatus.PENDING,
    revenue: 15000000,
    paymentHistory: [],
    callCount: 5
  },
  {
    id: 'DH1003',
    customerName: 'Nguyễn Văn Mạnh',
    customerPhone: '0912345678',
    customerGroup: 'Bán lẻ',
    source: 'Facebook Ads',
    saleName: 'Nguyễn Văn A',
    createdAt: minutesAgo(50),
    productName: 'Máy xay sinh tố',
    requirements: '',
    status: OrderStatus.COMPLETED,
    revenue: 1200000,
    paymentHistory: [
       { id: 'PAY02', date: minutesAgo(10), amount: 1200000, content: 'Tiền mặt', imageProof: 'url' }
    ],
    callCount: 1
  },
    {
    id: 'DH1004',
    customerName: 'Đại Lý Điện Máy Xanh',
    customerPhone: '0988777111',
    customerGroup: 'Đại lý',
    source: 'Website',
    saleName: 'Trần Thị B',
    createdAt: minutesAgo(4000),
    productName: 'Lô hàng quạt điện',
    requirements: 'Kiểm tra kỹ tem bảo hành',
    status: OrderStatus.DELIVERING,
    revenue: 45000000,
    paymentHistory: [
       { id: 'PAY03', date: minutesAgo(3000), amount: 20000000, content: 'Đặt cọc', imageProof: 'url' }
    ],
    callCount: 2
  }
];