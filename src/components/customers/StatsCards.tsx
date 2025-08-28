import { CustomerStats } from '@/types/customer';
import { 
  UserIcon, 
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface StatsCardsProps {
  stats: CustomerStats;
  loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-200 p-3 rounded-lg">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Tổng khách hàng',
      value: formatNumber(stats.totalCustomers),
      icon: UserIcon,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Khách cá nhân',
      value: formatNumber(stats.individualCustomers),
      icon: UserIcon,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Khách doanh nghiệp',
      value: formatNumber(stats.companyCustomers),
      icon: BuildingOfficeIcon,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Đang hoạt động',
      value: formatNumber(stats.activeCustomers),
      icon: ArrowTrendingUpIcon,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      bgColor: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">
                {card.title}
              </p>
              <p className={`text-xl font-bold ${card.textColor} truncate`} title={card.value}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
