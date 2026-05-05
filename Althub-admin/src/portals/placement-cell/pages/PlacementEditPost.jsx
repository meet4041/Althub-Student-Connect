import PostForm from '../../shared/forms/PostForm.jsx';

export default function PlacementEditPost() {
  return (
    <PostForm
      config={{
        mode: 'edit',
        editTitle: 'Edit Placement Post',
        subtitle: 'Update placement post content or add new media.',
        backPath: '/placement-posts',
        successPath: '/placement-posts',
      }}
    />
  );
}
