/**
 *
 * @param {'admin' | 'moderator' | 'user'} role
 * @returns {boolean} Wether the role can see the private articles or not
 */
export default function canViewArticle(role) {
    if (["admin", "moderator"].includes(role)) return true;

    return false;
}
