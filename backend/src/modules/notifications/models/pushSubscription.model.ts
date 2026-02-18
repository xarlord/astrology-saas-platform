/**
 * Push Subscription Model
 */

import knex from '../../../config/database';

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePushSubscriptionInput {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

class PushSubscriptionModel {
  async create(data: CreatePushSubscriptionInput): Promise<PushSubscription> {
    const [subscription] = await db<PushSubscription>('push_subscriptions')
      .insert({
        user_id: data.userId,
        endpoint: data.endpoint,
        keys: data.keys,
        user_agent: data.userAgent,
      })
      .returning('*');

    return subscription;
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    return db<PushSubscription>('push_subscriptions')
      .where({ user_id: userId })
      .select('*');
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    const [subscription] = await db<PushSubscription>('push_subscriptions')
      .where({ endpoint })
      .select('*');

    return subscription || null;
  }

  async delete(id: string): Promise<boolean> {
    const count = await db<PushSubscription>('push_subscriptions')
      .where({ id })
      .delete();

    return count > 0;
  }

  async deleteByEndpoint(endpoint: string): Promise<boolean> {
    const count = await db<PushSubscription>('push_subscriptions')
      .where({ endpoint })
      .delete();

    return count > 0;
  }

  async deleteByUserId(userId: string): Promise<number> {
    return db<PushSubscription>('push_subscriptions')
      .where({ user_id: userId })
      .delete();
  }
}

export default new PushSubscriptionModel();
