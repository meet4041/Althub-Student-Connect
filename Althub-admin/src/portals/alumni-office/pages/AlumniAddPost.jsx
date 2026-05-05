import PostForm from '../../shared/forms/PostForm.jsx';

export default function AlumniAddPost() {
  return (
    <PostForm
      config={{
        title: 'Create Alumni Post',
        subtitle: 'Share an alumni update with your community.',
        backPath: '/alumni-posts',
        successPath: '/alumni-posts',
        placeholder: 'Share an alumni update...',
      }}
    />
  );
}
