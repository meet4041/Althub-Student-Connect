import PortalPostsPage from '../../shared/pages/PortalPostsPage.jsx';

export default function PlacementPosts() {
  return (
    <PortalPostsPage
      config={{
        breadcrumb: 'Placement Posts',
        title: 'Placement Posts',
        subtitle: 'Create, review, and manage placement posts from the shared admin feed workspace.',
        addPath: '/placement-add-post',
        editPath: '/placement-edit-post',
      }}
    />
  );
}
