export default interface IPhoto {
    id: string,
    source: string,
    status: 'public' | 'private',
    created_at: Date,
}