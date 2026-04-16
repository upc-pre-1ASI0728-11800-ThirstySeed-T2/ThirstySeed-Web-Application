import axios from 'axios';
import type { Subscription } from '../model/Subscription';

class SubscriptionService {
    private baseURL = 'https://thirstyseedapi-production.up.railway.app/api/v1/subscriptions';

    async getCurrentUser() {
        const userId = localStorage.getItem('userId');
        if (!userId) return null;
        return { id: Number(userId) };
    }

    createSubscription(subscription: Subscription) {
        return axios.post(`${this.baseURL}`, subscription, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    getSubscriptionByUserId(userId: number) {
        return axios.get(`/${this.baseURL}/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    private getToken() {
        return localStorage.getItem('token');
    }
}

export default new SubscriptionService();