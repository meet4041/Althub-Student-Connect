import PostForm from '../../shared/forms/PostForm.jsx';

export default function PlacementAddPost() {
  return (
    <PostForm
      config={{
        title: 'Create Placement Post',
        subtitle: 'Share a placement update with your community.',
        backPath: '/placement-posts',
        successPath: '/placement-posts',
        placeholder: 'Share a placement update...',
      }}
    />
  );
}
