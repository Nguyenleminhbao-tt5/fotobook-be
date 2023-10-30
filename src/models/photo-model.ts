export default interface IPhoto {
    photo_id: String,
    source: String,
    status: 'public' | 'private',
    created_at: Date,
}