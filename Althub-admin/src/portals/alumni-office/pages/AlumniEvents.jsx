import PortalEventsPage from '../../shared/pages/PortalEventsPage.jsx';

export default function AlumniEvents() {
  return (
    <PortalEventsPage
      config={{
        breadcrumb: 'Alumni Events',
        title: 'Alumni Events',
        subtitle: 'Create, review, and manage alumni events with the shared admin event workspace.',
        addPath: '/alumni-add-event',
        editPath: '/alumni-edit-event',
        emptyText: 'Create your first alumni event',
      }}
    />
  );
}
