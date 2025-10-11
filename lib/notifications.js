import { supabase } from './supabase'

/**
 * Create a notification for a user
 */
export const createNotification = async (notificationData) => {
  try {
    const insertData = {
      user_id: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      reference_type: notificationData.referenceType,
      reference_id: notificationData.referenceId,
      is_read: false
    }
    
    // Add package_slug if provided
    if (notificationData.packageSlug) {
      insertData.package_slug = notificationData.packageSlug
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true, notification: data }
  } catch (err) {
    console.error('Error in createNotification:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, notifications: data || [] }
  } catch (err) {
    console.error('Error in getUserNotifications:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (err) {
    console.error('Error in getUnreadCount:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in markAsRead:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all as read:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in markAllAsRead:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in deleteNotification:', err)
    return { success: false, error: err.message }
  }
}
