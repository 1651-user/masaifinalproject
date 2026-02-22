export const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
    }).format(price);
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const getStatusColor = (status) => {
    const colors = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

export const truncate = (str, len = 60) => {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "..." : str;
};
