export default interface IPhoto {
    photo_id: string,
    source: string,
    status: 'public' | 'private',
    created_at: Date,
}