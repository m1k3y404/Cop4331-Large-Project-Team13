import 'session_store_base.dart';
import 'session_store_stub.dart'
    if (dart.library.io) 'session_store_io.dart'
    as store_impl;

export 'session_store_base.dart';

SessionStore createDefaultSessionStore() =>
    store_impl.createDefaultSessionStore();
