import { useEffect, useState } from 'react';
import {
    Star,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Package,
    Settings,
    X,
    User
} from 'lucide-react';
import {
    getAllPackagesWithRatings,
    getPackageServicesWithRatings,
    getPackageReviews,
    getServiceReviews,
    PackageWithRating,
    ServiceWithRating,
    Review
} from '../services/database';

export function PackageReviews() {
    const [packages, setPackages] = useState<PackageWithRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPackage, setExpandedPackage] = useState<number | null>(null);
    const [packageServices, setPackageServices] = useState<Record<number, ServiceWithRating[]>>({});
    const [selectedItemReviews, setSelectedItemReviews] = useState<Review[]>([]);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            setLoading(true);
            const data = await getAllPackagesWithRatings();
            setPackages(data);
        } catch (error) {
            console.error('Error loading packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePackage = async (pkgId: number) => {
        if (expandedPackage === pkgId) {
            setExpandedPackage(null);
            return;
        }

        setExpandedPackage(pkgId);
        if (!packageServices[pkgId]) {
            try {
                const services = await getPackageServicesWithRatings(pkgId);
                setPackageServices((prev: Record<number, ServiceWithRating[]>) => ({ ...prev, [pkgId]: services }));
            } catch (error) {
                console.error('Error loading services:', error);
            }
        }
    };

    const handleShowPackageReviews = async (pkg: PackageWithRating) => {
        try {
            const reviews = await getPackageReviews(pkg.p_cod);
            setSelectedItemReviews(reviews);
            setModalTitle(`Reseñas de ${pkg.p_nombre_paq}`);
            setShowReviewsModal(true);
        } catch (error) {
            console.error('Error loading package reviews:', error);
        }
    };

    const handleShowServiceReviews = async (svc: ServiceWithRating) => {
        try {
            const reviews = await getServiceReviews(svc.s_cod);
            setSelectedItemReviews(reviews);
            setModalTitle(`Reseñas de ${svc.s_nombre}`);
            setShowReviewsModal(true);
        } catch (error) {
            console.error('Error loading service reviews:', error);
        }
    };

    const renderStars = (rating: number) => {
        const val = Number(rating) || 0;
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(val) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
                <span className="text-sm font-bold ml-1 text-gray-700">{val.toFixed(1)}</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-blue)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reseñas y Calificaciones</h1>
                    <p className="text-[var(--color-text-secondary)]">Explora las opiniones de nuestros viajeros sobre paquetes y servicios.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {packages.map((pkg) => (
                    <div key={pkg.p_cod} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                        <div
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--color-background)] transition-colors"
                            onClick={() => togglePackage(pkg.p_cod)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{pkg.p_nombre_paq}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1">{pkg.p_descripcion_paq}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div
                                    className="px-4 py-2 bg-gray-50 rounded-lg flex flex-col items-center hover:bg-gray-100 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShowPackageReviews(pkg);
                                    }}
                                >
                                    <span className="text-xs text-[var(--color-text-secondary)] mb-1">Calificación Promedio</span>
                                    {renderStars(pkg.p_avg_rating)}
                                    <span className="text-xs text-blue-600 mt-1 font-medium">{pkg.p_review_count} reseñas</span>
                                </div>
                                {expandedPackage === pkg.p_cod ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>

                        {expandedPackage === pkg.p_cod && (
                            <div className="border-t border-[var(--color-border)] bg-gray-100 p-6">
                                <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Servicios Incluidos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {packageServices[pkg.p_cod]?.map((svc) => (
                                        <div key={svc.s_cod} className="bg-white border border-[var(--color-border)] p-4 rounded-lg shadow-sm flex flex-col justify-between">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-[var(--color-text-primary)]">{svc.s_nombre}</span>
                                                </div>
                                            </div>
                                            <div
                                                className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-blue-200"
                                                onClick={() => handleShowServiceReviews(svc)}
                                            >
                                                {renderStars(svc.s_avg_rating)}
                                                <span className="text-xs text-blue-600 font-medium">{svc.s_review_count} reseñas</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!packageServices[pkg.p_cod] || packageServices[pkg.p_cod].length === 0) && (
                                        <p className="text-sm text-gray-500 italic">No hay servicios registrados en este paquete.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showReviewsModal && (
                <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
                            <button
                                onClick={() => setShowReviewsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedItemReviews.length > 0 ? (
                                selectedItemReviews.map((review) => (
                                    <div key={review.r_cod} className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg relative h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{review.r_user_name}</p>
                                                    <div className="flex gap-1 mt-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.r_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                {new Date(review.r_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <p className="text-gray-800 leading-relaxed italic text-base">"{review.r_description}"</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Aún no hay reseñas para este elemento.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowReviewsModal(false)}
                                className="px-6 py-2 bg-[var(--color-primary-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
