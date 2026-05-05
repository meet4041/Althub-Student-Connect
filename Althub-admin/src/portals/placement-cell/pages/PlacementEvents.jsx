import PortalEventsPage from '../../shared/pages/PortalEventsPage.jsx';

export default function PlacementEvents() {
  return (
    <PortalEventsPage
      config={{
        breadcrumb: 'Placement Events',
        title: 'Placement Events',
        subtitle: 'Create, review, and manage placement events with the shared admin event workspace.',
        addPath: '/placement-add-event',
        editPath: '/placement-edit-event',
        emptyText: 'Create your first placement event',
      }}
    />
  );
}
